import CookiecordClient, { command, Inhibitor, Module, optional } from "cookiecord";
import { User, Message, MessageEmbed, TextChannel } from "discord.js";

const requisites: Inhibitor = async msg => (msg.guild &&
    (msg.channel.type == "GUILD_VOICE" || msg.channel.type == "GUILD_TEXT") &&
    msg.channel.parent) ? undefined : "bad channel";

interface QueueEntry {
    userId: string;
    joinTime: number;
    turnsTaken: number;
}

interface ChannelEvent {
    queue: QueueEntry[];
    currentUserId?: string;
    id: string;
    lastRead: number;
    allowJoins: boolean;
    disallowOnCycle: boolean;
}

export default class QueueModule extends Module {
    constructor(client: CookiecordClient) {
        super(client);
    }

    events: Map<string, ChannelEvent> = new Map();

    private getEvent(msg: Message): ChannelEvent {
        const chan = (<TextChannel>msg.channel);
        if (!chan.parentId) {
            throw new Error("assert chan.parentId is truthy");
        }

        const HOUR = 3600000;
        if (this.events.has(chan.parentId)) {
            const event = this.events.get(chan.parentId)!;
            if (Date.now() - event.lastRead > HOUR) {
                this.events.delete(chan.parentId);
                return this.getEvent(msg);
            }
            event.lastRead = Date.now();
            return event;
        } else {
            const event: ChannelEvent = { queue: [],
                id: chan.parentId,
                lastRead: Date.now(),
                allowJoins: true,
                disallowOnCycle: true
            };
            this.events.set(chan.parentId, event);
            return this.getEvent(msg); // felt like a bit of recursion today..
        }
    }

    private indexOfUserId(queue: QueueEntry[], id: string) {
        return queue.map((q, i) => [q, i] as const).filter(([q]) => q.userId == id)[0][1];
    }

    private sortEventQueue(evt: ChannelEvent) {
        // Sort over the amount of turns taken, and fallback to the join order
        evt.queue = evt.queue
            .sort((a, b) => a.joinTime - b.joinTime)
            .sort((a, b) => b.turnsTaken - a.turnsTaken);
    }

    private getLockEmoji(msg: Message) {
        const evt = this.getEvent(msg);
        return !evt.allowJoins ? (evt.disallowOnCycle ? "🔏" : "🔐") : "";
    }

    private getStateEmbed(msg: Message, joiningUserId?: string): MessageEmbed {
        const evt = this.getEvent(msg);
        const list = evt.queue.map((entry, i) => {
            const ifActive = (str: string) => evt.currentUserId == entry.userId ? str : "";
            const joinIndicator = joiningUserId == entry.userId ? "⇐" : ""
            return `${ifActive("**")}${i} <@${entry.userId}>${ifActive(" (active) **")}${joinIndicator}`
        }).join("\n");
        return new MessageEmbed({
            description: `
**__Queue for <#${evt.id}>__** ${this.getLockEmoji(msg)}

${evt.queue.length == 0 ? "There's no one here yet.." : list}`
        })
    }

    private async canManage(msg: Message) {
        let ret = false;
        if (this.client.botAdmins.includes(msg.author.id)) ret = true;
        if (msg.member?.permissions.has("MANAGE_MESSAGES")) ret = true;

        if (!ret && msg.member?.roles?.cache.some(role => role.name == "Apprentice Teacher")) {
            const CHECK = "✅";
            const nmsg = await msg.reply(":eyes: hi there, apprentice! are you sure?");
            await nmsg.react(CHECK);
            const result = await nmsg.awaitReactions({
                filter: (r, u) => u.id == msg.author.id && r.emoji.name == CHECK,
                max: 1, time: 1000 * 60, errors: []
            });
            if (result.first()) {
                await nmsg.edit("<:prommy_anonvote:1213676581826986044>");
                ret = true;
            }
        }

        if (ret) msg.react("🔐");
        return ret;
    }

    @command({ inhibitors: [requisites], description: "join the queue" })
    async qjoin(msg: Message, @optional user?: User) {
        const evt = this.getEvent(msg);

        if (user && !(await this.canManage(msg))) {
            await msg.channel.send(":warning: you must be a mod to add other users to the queue!");
            return;
        }
        if (!user && !evt.allowJoins) {
            await msg.channel.send(":warning: joining has been disabled for this event. come on time!");
            return;
        }
        const targetId = user?.id || msg.author.id;

        if (evt.queue.some(e => e.userId == targetId)) {
            await msg.channel.send(`:warning: ${user?`${user}'s'`:"you're"} already in there!`);
            return;
        }

        evt.queue.push({ turnsTaken: 0, joinTime: Date.now(), userId: targetId });
        this.sortEventQueue(evt);
        if (!evt.currentUserId) {
            evt.currentUserId = evt.queue[0].userId;
            evt.queue[0].turnsTaken++;
        }
        await msg.channel.send({
            content: `okay, added ${user||"you"} to the queue!`,
            embeds: [this.getStateEmbed(msg, targetId)]
        })
    }

    @command({ inhibitors: [requisites], description: "leave the queue" })
    async qleave(msg: Message, @optional user?: User) {
        if (!msg.member) return;
        const evt = this.getEvent(msg);
        if (!evt.queue.some(e => e.userId == msg.author.id) && !user) {
            await msg.channel.send(":warning: you aren't in the queue");
            return;
        }

        if (user && !(await this.canManage(msg))) {
            return await msg.channel.send(":warning: you must be a mod to kick people from the queue!");
        }
        const targetId = user?.id || msg.author.id;

        if (evt.currentUserId == targetId) {
            evt.currentUserId = evt.queue[(this.indexOfUserId(evt.queue, evt.currentUserId!) + 1) % evt.queue.length].userId;
        }
        evt.queue = evt.queue.filter(e => e.userId !== targetId);
        this.sortEventQueue(evt);
        await msg.channel.send({
            content: `okay, ${user ? "kicked user" : "removed you"} from the queue`,
            embeds: [this.getStateEmbed(msg)]
        })
    }

    @command({ inhibitors: [requisites], description: "clear the queue of all previous state", aliases: ["qflush"] })
    async qclear(msg: Message) {
        if (!(await this.canManage(msg))) {
            return await msg.channel.send(":warning: you must be a mod to clear the queue!");
        }

        const chan = (<TextChannel>msg.channel);
        if (!chan.parentId) {
            throw new Error("assert chan.parentId is truthy");
        }

        this.events.delete(chan.parentId);
        await msg.channel.send({
            content: "a new era begins:",
            embeds: [this.getStateEmbed(msg)]
        })
    }

    @command({ inhibitors: [requisites], description: "get the current queue status" })
    async queue(msg: Message) {
        await msg.channel.send({ embeds: [this.getStateEmbed(msg)] });
    }

    @command({ inhibitors: [requisites], description: "cycle the queue to the next participant" })
    async qcycle(msg: Message, @optional count: number = 1) {
        const evt = this.getEvent(msg);
        if (!msg.member) return;
        if (msg.author.id == evt.currentUserId) count = 1;
        if (evt.queue.length < 2) {
            return await msg.channel.send(`:x: i need at least 2 people in the queue, but there's only ${evt.queue.length}.`);
        }

        if (count < 0) count = evt.queue.length - Math.min(Math.abs(count), evt.queue.length);

        if (msg.author.id == evt.currentUserId || (await this.canManage(msg))) {
            // HACk this is a bit inelegant
            for (let i = 0; i < count; i++) {
                evt.currentUserId = evt.queue[(this.indexOfUserId(evt.queue, evt.currentUserId!) + 1) % evt.queue.length].userId;
                evt.queue[this.indexOfUserId(evt.queue, evt.currentUserId!)].turnsTaken += count;
            }
            if (evt.disallowOnCycle) evt.allowJoins = false;
            await msg.channel.send({
                content: ":ok_hand:",
                embeds: [this.getStateEmbed(msg)]
            })
        } else {
            await msg.channel.send(":warning: you aren't a mod or the currently active participant!");
        }
    }

    @command({ inhibitors: [requisites], description: "swap two people in the queue" })
    async qswap(msg: Message, fromIdx: number, toIdx: number) {
        const evt = this.getEvent(msg);
        if (!msg.member) return;

        if (await this.canManage(msg)) {
            const origTo: string = JSON.parse(JSON.stringify(evt.queue[toIdx].userId));
            evt.queue[toIdx].userId = evt.queue[fromIdx].userId;
            evt.queue[fromIdx].userId = origTo;
            this.sortEventQueue(evt);
            await msg.channel.send({
                content: "swappity swap",
                embeds: [this.getStateEmbed(msg)]
            })
        } else {
            await msg.channel.send(":warning: you aren't a mod!");
        }
    }


    @command({ inhibitors: [requisites], description: "toggle joining the queue, put the gates up! or take them down", aliases: ["qlock", "qshutoff"],  })
    async qcutoff(msg: Message) {
        const evt = this.getEvent(msg);
        if (!msg.member) return;

        if (await this.canManage(msg)) {
            evt.allowJoins = !evt.allowJoins;
            evt.disallowOnCycle = false;
            await msg.channel.send({
                content: `${this.getLockEmoji(msg) || ":ok_hand:"} ${evt.allowJoins ? "joining the queue is now allowed! \`ep qjoin\`" : "joining the queue is now disallowed!"}`,
            })
        } else {
            await msg.channel.send(":warning: you aren't a mod!");
        }
    }
}
