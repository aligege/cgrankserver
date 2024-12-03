import * as _ from "underscore";
import { cg } from "cgserver";

export class CgRankConfig extends cg.IServerConfig
{
    webserver:cg.WebServerConfig
}
export let GCgRankCfg = new CgRankConfig("cgrank")