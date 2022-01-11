import CookiecordClient from "cookiecord";
import { Message, Intents } from "discord.js";
import dotenv from "dotenv-safe";
import AdminModule from "./modules/admin";
import QueueModule from "./modules/queue";
import RateModule from "./modules/rate";


dotenv.config();

// TODO replace this with a better solution in cookiecord
const isUpper = (a: string) => a == a.toUpperCase();
const caseInsensitivePrefix =
    (prefix: string) => (msg: Message) => [...prefix]
        .map(x => isUpper(msg.content.slice(0, prefix.length)) ? x.toUpperCase() : x.toLowerCase())
        .join("");

const client = new CookiecordClient(
    {
        botAdmins: process.env.BOT_ADMINS?.split(","),
        prefix: caseInsensitivePrefix("ep "),
    },
    {
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        ],
        allowedMentions: { parse: ["users"] }
    }
);


if (process.argv[0].endsWith("ts-node")) {
    client.loadModulesFromFolder("src/modules");
    client.reloadModulesFromFolder("src/modules");
} else {
    client.registerModule(AdminModule);
    client.registerModule(RateModule);
    client.registerModule(QueueModule);
}

client.login(process.env.TOKEN);
client.on("ready", () => console.log(`Logged in as ${client.user?.tag}`));
