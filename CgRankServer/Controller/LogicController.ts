import * as _ from "underscore";
import { cg } from "cgserver";
import { CommandItem, GRankSer } from "../Logic/RankService";

//先去掉其他的，只支持OpenSocial登陆
export class LogicController extends cg.BaseController
{
    async onExcute()
    {
        let msg = this.postData
        if(!msg)
        {
            this.showJson({errcode:{id:1,msg:"msg is null"}})
            return
        }
        let cmd = (msg.cmd||"").toLowerCase()
        if(cmd=="removerank")
        {
            GRankSer.removeRank(msg.key||"")
            this.showJson()
            return
        }
        if(cmd=="saveallrank")
        {
            GRankSer.saveAllRank()
            this.showJson()
            return
        }
        if(cmd=="getallrankkeys")
        {
            let keys = GRankSer.getAllRankKeys()
            this.showJson({keys:keys})
            return
        }
        if(cmd=="getrankitem")
        {
            let rank = GRankSer.getRankItem(msg.key||"",msg.id||"")
            this.showJson({rank:rank})
            return
        }
        if(cmd=="getrankitems")
        {
            let ranks = GRankSer.getRankItems(msg.key||"",msg.ids||[])
            this.showJson({ranks:ranks})
            return
        }
        if(cmd=="getranklist")
        {
            let ranks = GRankSer.getRankList(msg.key||"",msg.start||0,msg.count||0)
            this.showJson({ranks:ranks})
            return
        }
        if(cmd=="getrankcount")
        {
            let count = GRankSer.getRankCount(msg.key||"")
            this.showJson({count:count})
            return
        }
        if(cmd=="getrevranklist")
        {
            let ranks = GRankSer.getRevRankList(msg.key||"",msg.start||0,msg.count||10)
            this.showJson({ranks:ranks})
            return
        }
        if(cmd=="addtorank")
        {
            let rank = GRankSer.addToRank(msg.key||"",msg.id||"",msg.score||0,msg.other||{},msg.isreplace||false)
            this.showJson({rank:rank})
            return
        }
        if(cmd=="addstorank")
        {
            let ranks = GRankSer.addsToRank(msg.key||"",msg.datas||{},msg.isreplace||false)
            this.showJson({ranks:ranks})
            return
        }
        if(cmd=="removefromrank")
        {
            GRankSer.removeFromRank(msg.key||"",msg.id||"")
            this.showJson()
            return
        }
        if(cmd=="updateinrank")
        {
            let ranks = GRankSer.executeCommand(msg.key||"",msg.command)
            this.showJson({ranks:ranks})
            return
        }
        if(cmd=="updatesinrank")
        {
            let ranks = GRankSer.executeCommand(msg.key||"",msg.commands||{})
            this.showJson({ranks:ranks})
            return
        }
        if(cmd=="executecommand")
        {
            let ranks = GRankSer.executeCommand(msg.key||"",msg.commands||{})
            this.showJson({ranks:ranks})
            return
        }
        if(cmd=="anycall")
        {
            let call = msg.call
            if(!call)
            {
                this.showJson({errcode:{id:1,msg:"call is null"}})
                return
            }
            let func = GRankSer[call]
            if(!func)
            {
                this.showJson({errcode:{id:2,msg:"func not found"}})
                return
            }
            let args = call.args||[]
            let result = func(...args)
            this.showJson({result:result})
            return
        }
        this.showJson({errcode:{id:1,msg:"cmd not found"}})
    }
}
