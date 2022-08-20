import CookiecordClient, { command, CommonInhibitors, listener, Module } from "cookiecord";
import { Message, TextBasedChannel, MessageReaction, User } from "discord.js";
import { logger } from "../logger";

export default class TopicsModule extends Module {
    constructor(client: CookiecordClient) {
        super(client);
    }

    midiDash = "–";
    longDash = "—";
    moons = ["🌑", "🌒", "🌔", "🌕"];

    @command({ inhibitors: [CommonInhibitors.guildsOnly] })
    async topics(msg: Message): Promise<void> {
        if (!msg.member || !msg.guild) return;
        const topicsChan = (await msg.guild.channels.fetch()).filter(c => c.name == "lounge-topics").first();
        if (!topicsChan || topicsChan.type !== "GUILD_TEXT") {
            throw new Error("couldn't find #lounge-topics");
        }

        const msgs = [...(await topicsChan.messages.fetch({ limit: 50 })).values()];
        let topics: string[] = [];
        for (const tm of msgs) {
            if (tm.content.includes("⬇️")) {
                break;
            } else {
                topics = [...topics, ...tm.content.split("\n")
                    .filter(line => line.startsWith("-"))
                    .map(line => line.replace(/^-\s+/, ""))];
            }
        }

        await Promise.all(topics.map(topic => this.makeRateMessage(msg.channel, topic)))
    }

    async makeRateMessage(channel: TextBasedChannel, topic: string) {
        const msg = await channel.send(topic + "\n`:`");
        await Promise.all(this.moons.map(moon => msg.react(moon)));
    }

    @listener({ event: "messageReactionAdd" })
    async onReact(reaction: MessageReaction, user: User) {
        const msg = reaction.message;
        if (!(msg instanceof Message)) return logger.warn("got partial message");
        if (user.id == this.client.user?.id && msg.author?.id == this.client.user?.id) return;
        const ourMoon = msg.reactions.resolve(this.moons[0]);
        if (!(ourMoon && this.client.user && (await ourMoon.users.fetch()).has(this.client.user.id))) return;

        const reacts = this.moons.map(moon => msg.reactions.resolve(moon)).filter(m => !!m) as MessageReaction[];
        if (reacts.length !== this.moons.length) throw new Error("missing reactions");
        const votes: number[] = reacts.map((react, i) => Array(react.count - 1).fill(i + 1)).flat(1);
        const avg = votes.reduce((a, b) => a + b, 0) / (votes.length || 1);

        let mutAvg = +`${avg}`;
        let editMoons = "";
        let editMoonCount = 0;
        while (mutAvg > 0) {
            if (mutAvg >= 1) {
                editMoons += "🌕";
                editMoonCount++;
                mutAvg -= 1;
            } else if (avg >= 0.5) {
                editMoons += "🌗";
                editMoonCount++;
                mutAvg -= 0.5;
            } else {
                break;
            }
        }

        if (editMoonCount < 4) editMoons += "🌑".repeat(4 - editMoonCount);

        await msg.edit(msg.content.split("\n").filter(line => !line.startsWith("`:`")).join("\n")
            + "\n`:`" + editMoons + `\`${avg.toFixed(1)}\``);
    }

    @listener({ event: "messageReactionRemove" })
    async onRemoveReact(reaction: MessageReaction, user: User) {
        this.onReact(reaction, user);
    }
}
