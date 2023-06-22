import { AudioPlayer, AudioPlayerIdleState, AudioPlayerState, AudioPlayerStatus, createAudioResource, joinVoiceChannel, VoiceConnectionStatus } from "@discordjs/voice";
import CookiecordClient, { command, CommonInhibitors, listener, mergeInhibitorsNonXor, Module, optional } from "cookiecord";
import { Message, TextChannel, VoiceChannel } from "discord.js";
import { join } from "path/posix";
import { VoiceUtils } from "../voice";

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
        const voice = new VoiceUtils(<TextChannel>msg.channel, msg.author);

        await voice.waitForConnectionStatus(VoiceConnectionStatus.Ready);

        const resources = ["start", "loop", "end"].map(x =>
            createAudioResource(join(__dirname, "..", "resources", `drum${x}.ogg`)));

        voice.audioPlayer.play(resources[0]);
        await voice.waitForPlayerStatus(AudioPlayerStatus.Idle);

        let looping = true;
        setTimeout(() => {
            voice.audioPlayer.stop();
            looping = false;
        }, durationMs);

        while (looping) {
            voice.audioPlayer.play(resources[1]);
            await voice.waitForPlayerStatus(AudioPlayerStatus.Idle);
            // seek back
            resources[1] = createAudioResource(join(__dirname, "..", "resources", `drumloop.ogg`));
        }
        voice.audioPlayer.play(resources[2]);
        await voice.waitForPlayerStatus(AudioPlayerStatus.Idle);

        voice.destroy();
    }
}
