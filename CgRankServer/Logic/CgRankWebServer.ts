import { cg } from 'cgserver';
import { LogicController } from '../Controller/LogicController';
import { GCgRankCfg } from '../Config/CgRankConfig';

//实现对controller的手动注册
export let GCgRankWebServer:CgRankWebServer=null
export class CgRankWebServer extends cg.IWebServer
{
    start()
    {
        GCgRankCfg.init()
        let port = cg.global.gCgServer.argv.port
        if(port)
        {
            GCgRankCfg.webserver.port=parseInt(port)
        }
        return super.start(GCgRankCfg.webserver)
    }
    /**
     * 注册控制器
     * eg:GCtrMgr.registerController("GameStatistics","System",SystemController)
     */
    protected _registerController()
    {
        cg.global.gCtrMgr.registerController("cgrank","logic",LogicController)
    }
}
GCgRankWebServer=new CgRankWebServer()
