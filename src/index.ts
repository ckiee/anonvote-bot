import CookiecordClient from "cookiecord";
import { Message, Intents } from "discord.js";
import dotenv from "dotenv-safe";
import AdminModule from "./modules/admin";
import QueueModule from "./modules/queue";
import RandomModule from "./modules/random";
import RateModule from "./modules/rate";


dotenv.config();

const client = new CookiecordClient(
    {
        botAdmins: process.env.BOT_ADMINS?.split(","),
        prefix: (msg: Message) => ((/^ep/gi.exec(msg.content) || [])[0] || "ep")
    },
    {
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
            Intents.FLAGS.DIRECT_MESSAGES,
            Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
            Intents.FLAGS.GUILD_MEMBERS,
            Intents.FLAGS.GUILD_VOICE_STATES,
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
    client.registerModule(RandomModule);
}

client.login(process.env.TOKEN);
client.on("ready", () => console.log(`Logged in as ${client.user?.tag}`));
