import { AudioPlayer, AudioPlayerIdleState, AudioPlayerState, AudioPlayerStatus, createAudioResource, joinVoiceChannel, PlayerSubscription, VoiceConnection, VoiceConnectionStatus } from "@discordjs/voice";
import { Message, TextChannel, VoiceChannel } from "discord.js";
import { join } from "path";

export class VoiceUtils {
    audioPlayer: AudioPlayer = new AudioPlayer();
    sub?: PlayerSubscription;
    conn?: VoiceConnection;

    constructor(private chan: TextChannel) {
        if (!chan.parentId || !chan.parent) throw new Error("assert chan.parentId&&chan.parent is truthy");
        const voice = chan.parent.children.filter(c => c.type == "GUILD_VOICE").first();
        if (!voice) throw new Error("assert voice is truthy");
        const conn = this.conn = joinVoiceChannel({
            channelId: voice.id,
            guildId: voice.guild.id,
            // AAAAAAAAAAAAAA
            // @ts-ignore
            adapterCreator: voice.guild.voiceAdapterCreator,
            selfDeaf: true
        });
        const audioPlayer = this.audioPlayer;
        conn.on("error", e => { throw e });
        audioPlayer.on("error", e => { throw e });
        const sub = this.sub = conn.subscribe(audioPlayer);
        if (!sub) throw new Error("assert sub is truthy");
    }

    getPlayerStatus() {
        return new Promise<AudioPlayerState>((resolve) => {
            this.audioPlayer.once("stateChange", (o, s) => {
                resolve(s);
            });
        });
    }


    destroy() {
        if (this.sub) this.sub.unsubscribe();
        if (this.conn) {
            this.conn.disconnect();
            this.conn.destroy();
        }
    }

    // XXX: this may be redundant
    waitForConnectionStatus(st: VoiceConnectionStatus) {
        return new Promise<void>((resolve) => {
            this.conn!.once(st, async () => resolve());
        });
    }

    async waitForPlayerStatus(st: AudioPlayerStatus) {
        while ((await this.getPlayerStatus()).status !== st) { }
    }
}
