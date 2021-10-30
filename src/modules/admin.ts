import CookiecordClient, { command, CommonInhibitors, Module } from "cookiecord";
import { Message } from "discord.js";
import { inspect, promisify } from "util";
import { logger } from "../logger";
import { exec as execCb } from "child_process";
const exec = promisify(execCb);

export default class AdminModule extends Module {
    constructor(client: CookiecordClient) {
        super(client);
    }

    @command()
    async ping(msg: Message) {
        const CODEBLOCK = "```";
        const uname = await exec("uname -a");
        msg.reply(`Pong!
${CODEBLOCK}
up for ${process.uptime()}sec on ${process.platform} ${process.arch}
${uname.stdout}
${CODEBLOCK}`);
    }

    @command({
        description: "eval some js",
        single: true,
        inhibitors: [CommonInhibitors.botAdminsOnly]
    })
    async eval(msg: Message, js: string) {
        logger.warn(`${msg.author.tag} ${msg.author.id}: EVAL: ${js}`);
        try {
            let result = eval(js);
            if (result instanceof Promise) result = await result;
            if (typeof result != `string`) result = inspect(result);
            if (result.length > 1990)
                return await msg.channel.send(
                    `Message is over the discord message limit.`
                );
            await msg.channel.send(
                "```js\n" +
                result
                    .split(this.client.token)
                    .join("[TOKEN]")
                    .split("```")
                    .join("\\`\\`\\`") +
                "\n```"
            );
        } catch (error) {
            msg.channel.send(
                "error! " +
                (error || "")
                    .toString()
                    .split(this.client.token)
                    .join("[TOKEN]")
            );
        }
    }
}
