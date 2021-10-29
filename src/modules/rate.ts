import CookiecordClient, { command, listener, Module } from "cookiecord";
import { GuildMember, Interaction, Message, MessageActionRow, MessageButton, MessagePayload, MessageOptions, Collection } from "discord.js";
import { logger } from "../logger";

interface VoiceCategory {
    label: string;
    emoji: string;
}

const voiceCategories: Collection<string, VoiceCategory> = new Collection([
    ["pitch", { label: "Pitch (H1)", emoji: "🔥"} ],
    ["resonance", { label: "Resonance (R1)", emoji: "💧" }],
    ["weight", { label: "Vocal weight (ST)", emoji: "🌱" }],
    ["cleanness", { label: "Cleanness (HNR)", emoji: "⚗️" }]
]);

type VoiceRatings = Collection<string, (Set<string>)[]>; // <keyof voiceCategories, [userId][4]>
type InteractionState = { confirmAbort: boolean, ratings: VoiceRatings, originatorId: string; };

export default class RateModule extends Module {
    readonly redEmojis = [
        '<:r51:903738140546719744>',
        '<:r102:903738140148269098>',
        '<:r153:903738140479602728>',
        '<:r204:903738140160831509>',
        // '<:r255:903738140282462300>',
    ];

    constructor(client: CookiecordClient) {
        super(client);
    }

    stateStore: Collection<string, InteractionState> = new Collection(); // <messageId, ...>

    private makeMessage(state: InteractionState): MessagePayload | MessageOptions {
        return {
            content: "Rate voice",
            components: [
                ...voiceCategories.map((cat, id) => {
                    const rating = state.ratings.get(id);
                    if (!rating) throw new Error("invalid voiceCategories key");

                    // Average the button presses
                    const picks: number[] = [];
                    rating.forEach((set, idx) => picks.push(...Array(set.size).fill(idx + 1)));
                    const votedRating = picks.reduce((a, b) => a + b, 0) / picks.length;

                    const header = new MessageButton({
                        disabled: true,
                        label: `${cat.label} - ${isNaN(votedRating) ? "?" : votedRating.toFixed(2)}`,
                        emoji: cat.emoji,
                        style: "PRIMARY",
                        customId: `header#_#${id}`
                    });

                    return new MessageActionRow({
                        components: [
                            header,
                            ...this.redEmojis.map((emoji, i) => {
                                const btn = rating[i];
                                const isVoted = Math.round(votedRating) == i + 1;
                                return new MessageButton({
                                    label: btn ? btn.size ? btn.size.toString() : "" : "",
                                    emoji,
                                    style: isVoted ? "SUCCESS" : "SECONDARY",
                                    customId: `${i}#_#${id}`
                                })
                            })
                        ]
                    });
                }
                ),
                new MessageActionRow({
                    components: [
                        new MessageButton({
                            label: state.confirmAbort ? "Confirm Abort" : "Abort",
                            customId: "abort",
                            emoji: "🗑️",
                            style: "DANGER"
                        }),
                    ]
                })
            ]
        };
    }

    @command()
    async rate(msg: Message): Promise<void> {
        const ratings: VoiceRatings = new Collection([...voiceCategories.keys()]
            .map(key => ([key, Array(4).fill(0)
                .map(_ => new Set())])));
        const state: InteractionState = { confirmAbort: false, ratings, originatorId: msg.author.id };

        const reply = await msg.reply(this.makeMessage(state));
        this.stateStore.set(reply.id, state);
    }

    @listener({ event: "interactionCreate" })
    async buttonPress(intr: Interaction) {
        if (!intr.isButton()) return;
        const state = this.stateStore.get(intr.message.id);
        const err = async (reason: string) => {
            logger.error(reason);
            await intr.reply({ content: `:x: ${reason}`, ephemeral: true })
        }

        if (state == undefined) return err("Message is too old");

        const intrMsg = intr.message instanceof Message ? intr.message : await intr.channel?.messages.fetch(intr.message.id);
        if (!intrMsg) return err("Could not fetch interaction message, missing channel");
        const intrMemberId = intr.member instanceof GuildMember ? intr.member.id : intr.member?.user.id;
        if (!intrMemberId) return err("Could not fetch guild member");

        if (intr.customId == "abort") {
            if (state.originatorId !== intrMemberId) return err("You didn't make this poll!");
            if (state.confirmAbort && intr.channel) {
                await intrMsg.delete();
                return;
            } else {
                state.confirmAbort = true;
            }
        } else {
            // no awaits in this block to avoid race conditions
            const [rawLevel, vType] = intr.customId.split("#_#");
            const level = parseInt(rawLevel, 10);

            const rating = state.ratings.get(vType);
            if (!rating) return err("missing rating in `state.ratings`");

            if (rating[level].has(intr.user.id)) {
                rating[level].delete(intr.user.id);
            } else {
                rating.forEach(set => set.delete(intr.user.id));
                rating[level].add(intr.user.id);
            }
        }
        await intr.update(this.makeMessage(state));
    }

}
