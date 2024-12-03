import * as _ from "underscore";
import { cg } from "cgserver";

export class CgRankConfig extends cg.IServerConfig
{
    webserver:cg.WebServerConfig
    password=""
}
export let GCgRankCfg = new CgRankConfig("cgrank")