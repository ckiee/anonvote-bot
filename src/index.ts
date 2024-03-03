import CookiecordClient, { HelpModule } from "cookiecord";
import { Message, Intents } from "discord.js";
import dotenv from "dotenv-safe";
import AdminModule from "./modules/admin";
import DrumrollModule from "./modules/drumroll";
import QueueModule from "./modules/queue";
import RandomModule from "./modules/random";
import RateModule from "./modules/rate";
import TopicsModule from "./modules/topics";


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
            Intents.FLAGS.DIRECT_MESSAGES,
            Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
            Intents.FLAGS.GUILD_MEMBERS,
            Intents.FLAGS.GUILD_VOICE_STATES,
        ],
        allowedMentions: { parse: ["users"] }
    }
);


client.registerModule(HelpModule);
if (process.argv[0].endsWith("ts-node")) {
    client.loadModulesFromFolder("src/modules");
    client.reloadModulesFromFolder("src/modules");
} else {
    client.registerModule(AdminModule);
    client.registerModule(RateModule);
    client.registerModule(QueueModule);
    client.registerModule(RandomModule);
    client.registerModule(DrumrollModule);
    client.registerModule(TopicsModule);
}

client.login(process.env.TOKEN);
client.on("ready", () => console.log(`Logged in as ${client.user?.tag}`));
