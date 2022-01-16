import CookiecordClient, { command, Inhibitor, Module } from "cookiecord";
import { Message, MessageEmbed, TextChannel } from "discord.js";

const requisites: Inhibitor = async msg => (msg.guild && msg.channel.type == "GUILD_TEXT" && msg.channel.parent) ? undefined : "bad channel";

interface QueueEntry {
    userId: string;
    joinTime: number;
    turnsTaken: number;
}

interface ChannelEvent {
    queue: QueueEntry[];
    currentUserId?: string;
    id: string;
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

        if (this.events.has(chan.parentId)) {
            return this.events.get(chan.parentId)!;
        } else {
            const event: ChannelEvent = { queue: [], id: chan.parentId };
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
            .sort((a, b) => b.joinTime - a.joinTime)
            .sort((a, b) => b.turnsTaken - a.turnsTaken);
    }

    private getStateEmbed(msg: Message): MessageEmbed {
        const evt = this.getEvent(msg);
        const list = evt.queue.map(entry => {
            const ifActive = (str: string) => evt.currentUserId == entry.userId ? str : "";
            return `${ifActive("**")}- <@${entry.userId}>${ifActive(" (active) **")}`
        }).join("\n");
        return new MessageEmbed({
            description: `
**__Queue for <#${evt.id}>__**

${evt.queue.length == 0 ? "There's no one here yet.." : list}`
        })
    }

    @command({ inhibitors: [requisites], description: "join the queue" })
    async qjoin(msg: Message) {
        const evt = this.getEvent(msg);
        if (evt.queue.some(e => e.userId == msg.author.id)) {
            await msg.channel.send(":warning: you're already in there!");
            return;
        }
        evt.queue.push({ turnsTaken: 0, joinTime: Date.now(), userId: msg.author.id });
        this.sortEventQueue(evt);
        if (!evt.currentUserId) {
            evt.currentUserId = evt.queue[0].userId;
            evt.queue[0].turnsTaken++;
        }
        await msg.channel.send({
            content: "okay, added you to the queue!",
            embeds: [this.getStateEmbed(msg)]
        })
    }

    @command({ inhibitors: [requisites], description: "leave the queue" })
    async qleave(msg: Message) {
        const evt = this.getEvent(msg);
        if (!evt.queue.some(e => e.userId == msg.author.id)) {
            await msg.channel.send(":warning: you aren't in the queue");
            return;
        }

        if (evt.currentUserId == msg.author.id) {
            evt.currentUserId = evt.queue[(this.indexOfUserId(evt.queue, evt.currentUserId!) + 1) % evt.queue.length].userId;
        }
        evt.queue = evt.queue.filter(e => e.userId !== msg.author.id);
        this.sortEventQueue(evt);
        await msg.channel.send({
            content: "okay, removed you from the queue",
            embeds: [this.getStateEmbed(msg)]
        })
    }

    @command({ inhibitors: [requisites], description: "get the current queue status" })
    async queue(msg: Message) {
        await msg.channel.send({ embeds: [this.getStateEmbed(msg)] });
    }

    @command({ inhibitors: [requisites], description: "cycle the queue to the next participant" })
    async qcycle(msg: Message) {
        const evt = this.getEvent(msg);
        if (!msg.member) return;
        if (msg.member.permissions.has("MANAGE_MESSAGES") || msg.author.id == evt.currentUserId || this.client.botAdmins.includes(msg.author.id)) {
            evt.currentUserId = evt.queue[(this.indexOfUserId(evt.queue, evt.currentUserId!) + 1) % evt.queue.length].userId;
            evt.queue[this.indexOfUserId(evt.queue, evt.currentUserId!)].turnsTaken++;
            await msg.channel.send({
                content: ":ok_hand:",
                embeds: [this.getStateEmbed(msg)]
            })
        } else {
            await msg.channel.send(":warning: you aren't a mod or the currently active participant!");
        }
    }
}
