import CookiecordClient, { command, listener, Module } from "cookiecord";
import { GuildMember, Interaction, Message, MessageActionRow, MessageButton, MessagePayload, MessageOptions, Collection, MessageSelectMenu, MessageSelectOption } from "discord.js";
import { logger } from "../logger";

interface VoiceCategory {
    label: string;
    emoji: string;
    enabled: boolean;
}

type VoiceRatings = Collection<string, (Set<string>)[]>; // <keyof VoiceCategories, [userId][4]>
type VoiceCategories = Collection<string, VoiceCategory>;
interface InteractionState {
    confirmAbort: boolean;
    ratings: VoiceRatings;
    originatorId: string;
    participants: Set<string>; // <uid>
    state: "SETUP" | "VOTING";
    showParticipants: boolean;
    showVotes: boolean;
    categories: VoiceCategories;
    hasVotedBefore: boolean; // we need to disable category selection if there's data
};

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
        const abortButton = new MessageButton({
            label: state.confirmAbort ? "Confirm Abort" : "Abort",
            customId: "abort",
            emoji: "🗑️",
            style: "DANGER"
        });
        if (state.state == "SETUP") {
            return {
                embeds: [{ title: "Welcome to eVoicepRivATE", description: "Pick some options below! 😄"}],
                components: [
                    new MessageActionRow({
                        components: [
                            new MessageButton({
                                disabled: true,
                                customId: "headerVisibOptions",
                                style: "PRIMARY",
                                emoji: "💼",
                                label: "Visibility Options"
                            }),
                            new MessageButton({
                                customId: "showVotes",
                                style: state.showVotes ? "SUCCESS" : "DANGER",
                                emoji: "🔢",
                                label: "Show Votes"
                            }),
                            new MessageButton({
                                customId: "showParticipants",
                                style: state.showParticipants ? "SUCCESS" : "DANGER",
                                emoji: "👭",
                                label: "Show Participants"
                            })
                        ]
                    }),

                    new MessageActionRow({
                        components: [
                            new MessageSelectMenu({
                                customId: "extraCategory",
                                placeholder: "Select categories",
                                options: state.categories.map((category, id) => ({ default: category.enabled, emoji: category.emoji, label: category.label, value: id })),
                                minValues: 1,
                                maxValues: 4,
                                disabled: state.hasVotedBefore
                            })
                        ]
                    }),

                    new MessageActionRow({
                        components: [
                            new MessageButton({
                                customId: "setVoting",
                                style: "PRIMARY",
                                emoji: "🚀",
                                label: "Start voting"
                            }),
                            abortButton
                        ]
                    })
                ]
            };
        } else if (state.state == "VOTING") {
            const participants = state.participants.size
                ? `Participants (${state.participants.size}): ${[...state.participants].map(id => `<@${id}>`)}`
                : "No participants yet.";

            return {
                embeds: [{
                    title: "Rate voice",
                    description: state.showParticipants ? participants : "Participants hidden."
                }],
                components: [
                    ...state.categories.filter(cat => cat.enabled).map((cat, id) => {
                        const rating = state.ratings.get(id);
                        if (!rating) throw new Error("invalid categories key");

                        // Average the button presses
                        const picks: number[] = [];
                        rating.forEach((set, idx) => picks.push(...Array(set.size).fill(idx + 1)));
                        const votedRating = picks.reduce((a, b) => a + b, 0) / picks.length;

                        const UNICODE_NUM_EMOJI_SUFFIX = "️⃣";

                        return new MessageActionRow({
                            components: [
                                new MessageSelectMenu({
                                    customId: `select#_#${id}`,
                                    minValues: 1,
                                    maxValues: 1,
                                    options: Array(5).fill(0).map((_, i) => ({
                                        value: i.toString(10),
                                        emoji: (i + 1).toString(10) + UNICODE_NUM_EMOJI_SUFFIX,
                                        label: `${"🔴".repeat(i + 1)}${state.showVotes ? ` (${rating[i].size} votes)` : ""}`,
                                        default: false
                                    })),
                                    placeholder: cat.emoji + " " + cat.label + (state.showVotes ? ` - ${isNaN(votedRating) ? "?" : votedRating.toFixed(2)}` : "")
                                })
                            ]
                        });
                    }),
                    new MessageActionRow({
                        components: [
                            new MessageButton({
                                customId: "setSetup",
                                style: "PRIMARY",
                                emoji: "⚙️",
                                label: "Adjust settings"
                            }),
                            abortButton
                        ]
                    })
                ]
            };
        } else {
            return { content: `Unknown \`state.state\` ${JSON.stringify(state)}` };
        }
    }

    @command()
    async rate(msg: Message): Promise<void> {
        const categories: VoiceCategories = new Collection([
            ["pitch", { label: "Pitch (H1)", emoji: "🔥", enabled: true }],
            ["resonance", { label: "Resonance (R1)", emoji: "💧", enabled: true} ],
            ["weight", { label: "Vocal weight (ST)", emoji: "🌱", enabled: true} ],
            ["clarity", { label: "Clarity (HNR)", emoji: "⚗️", enabled: false }],
            ["twang",{"label":"Twang, none to a lot","emoji":"🦆","enabled":false}],
            ["kndel",{"label":"Knödel, none to a lot","emoji":"🥟","enabled":false}],
            ["closure",{"label":"Closure, pressed to breathy","emoji":"🛸","enabled":false}],
            ["nasality",{"label":"Nasality, hyponasal to hypernasal","emoji":"🐽","enabled":false}],
            ["vocal",{"label":"Vocal fry, none to a lot","emoji":"🍟","enabled":false}],
            ["false",{"label":"False folds, constricted to retracted","emoji":"🐉","enabled":false}],
            ["oropharynx",{"label":"Oropharynx (OPC), expanded to constricted","emoji":"🐱","enabled":false}],
            ["mouth",{"label":"Mouth space (R2), large to small​","emoji":"🎺","enabled":false}],
            ["strain",{"label":"Strain, low to high","emoji":"🧸","enabled":false}],
            ["fullness",{"label":"Fullness (ST:R1), hollow to overfull","emoji":"🥥","enabled":false}],
            ["intonation",{"label":"Intonation, masculine to feminine","emoji":"🎸","enabled":false}],
            ["congruence",{"label":"Congruence, low to high","emoji":"🔷","enabled":false}],
            ["consistency",{"label":"Consistency, low to high","emoji":"🍃","enabled":false}],
            ["naturalness",{"label":"Naturalness, low to high","emoji":"🎍","enabled":false}],
            ["perceived",{"label":"Perceived sex, male to female","emoji":"⚡","enabled":false}],
        ]);

        const ratings: VoiceRatings = new Collection([...categories.keys()]
            .map(key => ([key, Array(5).fill(0)
                .map(_ => new Set())])));
        const state: InteractionState = {
            confirmAbort: false,
            ratings,
            originatorId: msg.author.id,
            participants: new Set(),
            showParticipants: true,
            showVotes: false,
            state: "SETUP",
            categories,
            hasVotedBefore: false
        };

        const reply = await msg.reply(this.makeMessage(state));
        this.stateStore.set(reply.id, state);
    }

    @listener({ event: "interactionCreate" })
    async buttonPress(intr: Interaction) {
        if (!(intr.isButton() || intr.isSelectMenu())) return;
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
        } else if (intr.customId == "showVotes") {
            if (state.originatorId !== intrMemberId) return err("You didn't make this poll!");
            state.showVotes = !state.showVotes;
        } else if (intr.customId == "showParticipants") {
            if (state.originatorId !== intrMemberId) return err("You didn't make this poll!");
            state.showParticipants = !state.showParticipants;
        } else if (intr.customId == "setVoting") {
            if (state.originatorId !== intrMemberId) return err("You didn't make this poll!");
            state.state = "VOTING";
            // just incase they misclick, they can reset it by changing pages
            state.confirmAbort = false;
        } else if (intr.customId == "setSetup") {
            if (state.originatorId !== intrMemberId) return err("You didn't make this poll!");
            state.state = "SETUP";
            // see above
            state.confirmAbort = false;
        } else if (intr.customId == "extraCategory" && intr.isSelectMenu()) {
            if (state.originatorId !== intrMemberId) return err("You didn't make this poll!");
            state.categories = state.categories.mapValues((category, id) => {
                category.enabled = intr.values.includes(id);
                return category;
            });

        } else if (state.state == "VOTING" && intr.customId.startsWith("select#_#") && intr.isSelectMenu()) {
            // no awaits in this block to avoid race conditions
            state.hasVotedBefore = true;
            const categoryId = intr.customId.split("#_#")[1];
            if (intr.values.length <= 0) return;
            const level = parseInt(intr.values[0], 10);

            const rating = state.ratings.get(categoryId);
            if (!rating) return err("missing rating in `state.ratings`");
            if (level >= rating.length) return err("couldn't derefrence `rating[level]`")

            state.participants.add(intrMemberId);

            if (rating[level].has(intr.user.id)) {
                rating[level].delete(intr.user.id);
            } else {
                rating.forEach(set => set.delete(intr.user.id));
                rating[level].add(intr.user.id);
            }
        } else {
            return err(`unknown interaction customId ${intr.customId} in ${state.state}`);
        }
        await intr.update(this.makeMessage(state));
    }

}
