import CookiecordClient, { command, Inhibitor, listener, Module, optional } from "cookiecord";
import { Message, MessageEmbed, TextChannel, MessageActionRow, MessageButton, MessageSelectMenu, Interaction, GuildMember } from "discord.js";

export default class RandomModule extends Module {
    constructor(client: CookiecordClient) {
        super(client);
    }

    @command({ aliases: ["roll"], description: "pick a random person" })
    async random(msg: Message, @optional count: number = 1) {
        if (count <= 0) {
            await msg.channel.send("count must be ≥1");
            return;
        }
        await msg.reply({
            content: `react with :tada: on the original message to join.`,
            components: [
                new MessageActionRow({
                    components: [
                        new MessageButton({ emoji: "🥁", label: `Roll`, customId: `randomRoll:${count}`, style: "DANGER" })
                    ]
                }),
            ]
        });

        await msg.react("🎉");
    }

    @listener({ event: "interactionCreate" })
    async onRoll(intr: Interaction) {
        if (intr.inGuild() && intr.isButton() && intr.customId.startsWith("randomRoll") && intr.message instanceof Message && intr.message.reference && intr.message.reference.messageId && intr.member instanceof GuildMember) {
            const count = parseInt(intr.customId.split(":")[1], 10);
            const userMsg = await intr.message.channel.messages.fetch(intr.message.reference.messageId);
            if (intr.member.id !== userMsg.author.id) {
                await intr.reply({
                    ephemeral: true,
                    content: "this ain't yours! :^)"
                });
                return;
            }
            const reactions = userMsg.reactions.cache.get("🎉");
            if (!reactions) {
                await intr.reply("unable to fetch reactions");
                return;
            }
            const users = (await reactions.users.fetch()).filter(u => u.id !== this.client.user?.id).random(count).sort((_, __) => Math.random() * 2 - 1);
            await intr.reply({
                content: `okay, I rolled ${users.length == 1 ? "this" : "these"} ${users.length} user${users.length == 1 ? "" : "s"}:
${users.map(u => `- ${u}`).join("\n")}`,
                allowedMentions: { parse: [] }
            });
        }
    }
}
