import CookiecordClient, { command, Inhibitor, Module } from "cookiecord";
import { Message, MessageEmbed, TextChannel } from "discord.js";

const requisites: Inhibitor = async msg => (msg.guild && msg.channel.type == "GUILD_TEXT" && msg.channel.parent) ? undefined : "bad channel";

interface ChannelEvent {
    queue: string[]
    currentUserId?: string
    id: string
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

    private getStateEmbed(msg: Message): MessageEmbed {
        const evt = this.getEvent(msg);
        const list = evt.queue.map(userId => {
            const ifActive = (str: string) => evt.currentUserId == userId ? str : "";
            return `${ifActive("**")}- <@${userId}>${ifActive(" (active) **")}`
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
        if (evt.queue.includes(msg.author.id)) {
            await msg.channel.send(":warning: you're already in there!");
            return;
        }
        const currentIdx = evt.currentUserId ? evt.queue.indexOf(evt.currentUserId!) : 0;
        evt.queue.splice(currentIdx + 1, 0, msg.author.id);
        if (!evt.currentUserId) evt.currentUserId = evt.queue[0];
        await msg.channel.send({
            content: "okay, added you to the queue!",
            embeds: [this.getStateEmbed(msg)]
        })
    }

    @command({ inhibitors: [requisites], description: "leave the queue" })
    async qleave(msg: Message) {
        const evt = this.getEvent(msg);
        if (!evt.queue.includes(msg.author.id)) {
            await msg.channel.send(":warning: you aren't in the queue");
            return;
        }

        if (evt.currentUserId == msg.author.id) {
            evt.currentUserId = evt.queue[(evt.queue.indexOf(evt.currentUserId!) + 1) % evt.queue.length];
        }
        evt.queue = evt.queue.filter(id => id !== msg.author.id);
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
        if (msg.member.permissions.has("MANAGE_MESSAGES") || msg.author.id == evt.currentUserId) {
            evt.currentUserId = evt.queue[(evt.queue.indexOf(evt.currentUserId!) + 1) % evt.queue.length];
            await msg.channel.send({
                content: "done!",
                embeds: [this.getStateEmbed(msg)]
            })
        } else {
            await msg.channel.send(":warning: you aren't a mod or the currently active participant!");
        }
    }
}
