import { AudioPlayer, AudioPlayerIdleState, AudioPlayerState, AudioPlayerStatus, createAudioResource, joinVoiceChannel, VoiceConnectionStatus } from "@discordjs/voice";
import CookiecordClient, { command, CommonInhibitors, listener, mergeInhibitorsNonXor, Module, optional } from "cookiecord";
import { Message, TextChannel, VoiceChannel } from "discord.js";
import { join } from "path/posix";

export default class DrumrollModule extends Module {
    constructor(client: CookiecordClient) {
        super(client);
    }

    @command({
        inhibitors: [
            mergeInhibitorsNonXor(CommonInhibitors.hasGuildPermission("MANAGE_MESSAGES"),
                CommonInhibitors.botAdminsOnly)
        ]
    })
    async drumroll(msg: Message, @optional userDuration?: number): Promise<void> {
        const durationMs = (userDuration ? userDuration * 1000 : null) || Math.random() * 3000 + 2000;
        const chan = (<TextChannel>msg.channel);
        if (!chan.parentId || !chan.parent) throw new Error("assert chan.parentId&&chan.parent is truthy");
        const voice = chan.parent.children.filter(c => c.type == "GUILD_VOICE").first();
        if (!voice) throw new Error("assert voice is truthy");
        const conn = joinVoiceChannel({
            channelId: voice.id,
            guildId: voice.guild.id,
            // AAAAAAAAAAAAAA
            // @ts-ignore
            adapterCreator: voice.guild.voiceAdapterCreator,
            selfDeaf: true
        });
        const audioPlayer = new AudioPlayer();
        conn.on("error", e => { throw e });
        audioPlayer.on("error", e => { throw e });
        const sub = conn.subscribe(audioPlayer);
        if (!sub) throw new Error("assert sub is truthy");

        if (conn.state.status !== VoiceConnectionStatus.Ready) {
            await (() => new Promise<void>((resolve) => {
                conn.once(VoiceConnectionStatus.Ready, async () => resolve())
            }))();
        }

        function getPlayerStatus() {
            return new Promise<AudioPlayerState>((resolve) => {
                audioPlayer.once("stateChange", (o, s) => {
                    resolve(s);
                });
            });
        }

        const resources = ["start", "loop", "end"].map(x =>
            createAudioResource(join(__dirname, "..", "resources", `drum${x}.ogg`)));

        audioPlayer.play(resources[0]);
        while ((await getPlayerStatus()).status !== "idle") { }

        let looping = true;
        setTimeout(() => {
            audioPlayer.stop();
            looping = false;
        }, durationMs);

        while (looping) {
            audioPlayer.play(resources[1]);
            while ((await getPlayerStatus()).status !== "idle") { }
            // seek back
            resources[1] = createAudioResource(join(__dirname, "..", "resources", `drumloop.ogg`));
        }
        audioPlayer.play(resources[2]);
        while ((await getPlayerStatus()).status !== "idle") { }
        conn.disconnect();
        sub.unsubscribe();
        conn.destroy();
    }
}
