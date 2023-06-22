import { AudioPlayerEvents, AudioPlayer, AudioPlayerState, AudioPlayerStatus, createAudioResource, joinVoiceChannel, PlayerSubscription, VoiceConnection, VoiceConnectionStatus } from "@discordjs/voice";
import { Message, TextChannel, VoiceChannel, User } from "discord.js";
import { join } from "path";

export class VoiceUtils {
    audioPlayer: AudioPlayer = new AudioPlayer();
    sub?: PlayerSubscription;
    conn?: VoiceConnection;

    constructor(private chan: TextChannel, findUser: User) {
        if (!chan.parentId || !chan.parent) throw new Error("assert chan.parentId&&chan.parent is truthy");
        const voice = chan.parent.children.find(c => c.type == "GUILD_VOICE" && c.members.has(findUser.id));
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
            // error TS2345: Argument of type '"stateChange"' is not assignable to parameter of type 'AudioPlayerStatus.Idle'.
            // Not willing to suffer for this.
            // @ts-ignore
            this.audioPlayer.once("stateChange", (_o, s) => {
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
