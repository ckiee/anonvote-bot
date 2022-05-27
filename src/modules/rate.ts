import { AudioPlayerStatus, createAudioResource, VoiceConnectionStatus } from "@discordjs/voice";
import CookiecordClient, { command, listener, Module } from "cookiecord";
import { TextChannel, GuildMember, Interaction, Message, MessageActionRow, MessageButton, MessagePayload, MessageOptions, Collection, MessageSelectMenu, MessageSelectOption } from "discord.js";
import { join } from "path";
import { logger } from "../logger";
import {VoiceUtils} from "../voice";

interface VoiceCategory {
    label: string;
    emoji: string;
    enabled: boolean;
    lowest: string;
    highest: string;
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
    binaryVote: boolean;
};

function ratingToMoons(rating: number) {
    return Array(5).fill(0)
        .map((_, i) => Math.round(Math.max((rating - i) * 2, 0)) / 2)
        .map(x => x != 0 ? x < 1 ? "🌗":   " 🌕" : " 🌑 " )
            .join("");
};

export default class RateModule extends Module {
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
                embeds: [{ title: "Welcome to eVoicepRivATE", description: "Pick some options below!"}  ],
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
                            }),
                            new MessageButton({
                                customId: "binaryVote",
                                style: state.binaryVote ? "SUCCESS" : "DANGER",
                                emoji: "💡",
                                label: "Binary vote"
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

                        const mkVotePoint = (i: number) => (
                            {
                                value: i.toString(10),
                                emoji: (i + 1).toString(10) + UNICODE_NUM_EMOJI_SUFFIX,
                                label: `${"🔴".repeat(i + 1)}${state.showVotes ? ` (${rating[i].size} votes)` : ""}${i == 0 ? " (" + cat.lowest + ")": i == 4 ? " (" + cat.highest + ")" : ""}`,
                                default: false
                            }
                        );

                        return new MessageActionRow({
                            components: [
                                new MessageSelectMenu({
                                    customId: `select#_#${id}`,
                                    minValues: 1,
                                    maxValues: 1,
                                    options: [
                                        ...!state.binaryVote ? Array(5).fill(0).map((_, i) => mkVotePoint(i)) : [mkVotePoint(0), mkVotePoint(4)],
                                        ...(state.showVotes ? [{
                                            value: "total",
                                            emoji: "📈",
                                            label: `Total votes: ${rating.map(x => [...x].length).reduce((a, b) => a + b)}`,
                                            default: false
                                        }] : [])
                                    ],
                                    placeholder: cat.emoji + " " + cat.label + (state.showVotes ? ` - ${isNaN(votedRating) ? "?" : ratingToMoons(votedRating)}` : "")
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
            [
                "pitch",
                {
                    "label": "Pitch (H1)",
                    "emoji": "🔥",
                    "enabled": true,
                    "lowest": "low",
                    "highest": "high"
                }
            ],
            [
                "resonance",
                {
                    "label": "Larynx height (R1)",
                    "emoji": "💧",
                    "enabled": true,
                    "lowest": "dark",
                    "highest": "bright"
                }
            ],
            [
                "weight",
                {
                    "label": "Vocal weight (ST)",
                    "emoji": "🌱",
                    "enabled": true,
                    "lowest": "heavy",
                    "highest": "light"
                }
            ],
            [
                "clarity",
                {
                    "label": "Tone clarity (HNR)",
                    "emoji": "⚗️",
                    "enabled": false,
                    "lowest": "rough",
                    "highest": "clean"
                }
            ],
            [
                "twang",
                {
                    "label": "Twang",
                    "emoji": "🦆",
                    "enabled": false,
                    "lowest": "none",
                    "highest": "a lot"
                }
            ],
            [
                "kndel",
                {
                    "label": "Knödel",
                    "emoji": "🥟",
                    "enabled": false,
                    "lowest": "none",
                    "highest": "a lot"
                }
            ],
            [
                "closure",
                {
                    "label": "Closure",
                    "emoji": "🛸",
                    "enabled": false,
                    "lowest": "pressed",
                    "highest": "breathy"
                }
            ],
            [
                "nasality",
                {
                    "label": "Nasality",
                    "emoji": "🐽",
                    "enabled": false,
                    "lowest": "hyponasal",
                    "highest": "hypernasal"
                }
            ],
            [
                "vocal",
                {
                    "label": "Vocal fry",
                    "emoji": "🍟",
                    "enabled": false,
                    "lowest": "none",
                    "highest": "a lot"
                }
            ],
            [
                "false",
                {
                    "label": "False folds",
                    "emoji": "🐉",
                    "enabled": false,
                    "lowest": "constricted",
                    "highest": "retracted"
                }
            ],
            [
                "oropharynx",
                {
                    "label": "Oropharynx (OPC)",
                    "emoji": "🐱",
                    "enabled": false,
                    "lowest": "expanded",
                    "highest": "constricted"
                }
            ],
            [
                "mouth",
                {
                    "label": "Mouth space (R2)",
                    "emoji": "🎺",
                    "enabled": false,
                    "lowest": "large",
                    "highest": "small​"
                }
            ],
            [
                "strain",
                {
                    "label": "Strain",
                    "emoji": "🧸",
                    "enabled": false,
                    "lowest": "low",
                    "highest": "high"
                }
            ],
            [
                "fullness",
                {
                    "label": "Fullness (ST:R1)",
                    "emoji": "🥥",
                    "enabled": false,
                    "lowest": "hollow",
                    "highest": "overfull"
                }
            ],
            [
                "intonation",
                {
                    "label": "Intonation",
                    "emoji": "🎸",
                    "enabled": false,
                    "lowest": "masculine",
                    "highest": "feminine"
                }
            ],
            [
                "congruence",
                {
                    "label": "Congruence",
                    "emoji": "🔷",
                    "enabled": false,
                    "lowest": "low",
                    "highest": "high"
                }
            ],
            [
                "consistency",
                {
                    "label": "Consistency",
                    "emoji": "🍃",
                    "enabled": false,
                    "lowest": "low",
                    "highest": "high"
                }
            ],
            [
                "naturalness",
                {
                    "label": "Naturalness",
                    "emoji": "🎍",
                    "enabled": false,
                    "lowest": "low",
                    "highest": "high"
                }
            ],
            [
                "perceived",
                {
                    "label": "Perceived sex",
                    "emoji": "⚡",
                    "enabled": false,
                    "lowest": "male",
                    "highest": "female"
                }
            ]
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
            hasVotedBefore: false,
            binaryVote: false
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

        if (state == undefined) return;

        const intrMsg = intr.message instanceof Message ? intr.message : await intr.channel?.messages.fetch(intr.message.id);
        if (!intrMsg) return err("Could not fetch interaction message, missing channel");
        const intrMemberId = intr.member instanceof GuildMember ? intr.member.id : intr.member?.user.id;
        if (!intrMemberId) return err("Could not fetch guild member");


        const playClip = async (fn: string) => {
            const voice = new VoiceUtils(<TextChannel>intr.channel);
            await voice.waitForConnectionStatus(VoiceConnectionStatus.Ready);
            const res = createAudioResource(join(__dirname, "..", "resources", `${fn}.ogg`));
            voice.audioPlayer.play(res);
            await voice.waitForPlayerStatus(AudioPlayerStatus.Idle);
            voice.destroy();
        };

        if (intr.customId == "binaryVote") {
            state.binaryVote = !state.binaryVote;
            playClip(`no${state.binaryVote ? "" : "n"}Binary`);
        } else if (intr.customId == "abort") {
            if (state.confirmAbort && intr.channel) {
                await intrMsg.delete();
                return;
            } else {
                state.confirmAbort = true;
            }
        } else if (intr.customId == "showVotes") {
            if (state.originatorId !== intrMemberId) return err("You didn't make this poll!");
            state.showVotes = !state.showVotes;
            playClip(state.showVotes ? "showingVotes" : "hidingVotes");
        } else if (intr.customId == "showParticipants") {
            if (state.originatorId !== intrMemberId) return err("You didn't make this poll!");
            state.showParticipants = !state.showParticipants;
            playClip(`${state.showParticipants ? "showing" : "hiding"}Participants`);
        } else if (intr.customId == "setVoting") {
            if (state.originatorId !== intrMemberId) return err("You didn't make this poll!");
            state.state = "VOTING";
            // just incase they misclick, they can reset it by changing pages
            state.confirmAbort = false;
            playClip("startVoting");
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
            if (intr.values[0] != "total") {
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
            }
        } else {
            return err(`unknown interaction customId ${intr.customId} in ${state.state}`);
        }
        await intr.update(this.makeMessage(state));
    }

}
