import { cg } from "cgserver";
import fs from 'fs'

class RankItem
{
    id:string=""
    score:number=0
    rank:number=0
    other:{[key:string]:any}={}
}
class RankData
{
    //每个榜都有一个关键词
    key:string=""

    //数据
    maps:{[id:string]:RankItem}={}
    //有序列表
    list:RankItem[]=[]
    timeout:number=-1
}
export class CommandItem
{
    id:string=""
    score:number=0
    inc:{[key:string]:number}={}
    set:{[key:string]:number}={}
}
class RankService {
    protected _ranks:{[key:string]:RankData}={}
    removeRank(key:string)
    {
        this.saveRank(key)
        delete this._ranks[key]
    }
    saveAllRank()
    {
        for(let key in this._ranks)
        {
            this.saveRank(key)
        }
    }
    getAllRankKeys()
    {
        return Object.keys(this._ranks)
    }
    //保存排行榜数据
    saveRank(key:string)
    {
        let rankdata = this._ranks[key]
        if(rankdata) {
            let filename = `${rankdata.key}_${rankdata.timeout}.json`
            fs.writeFileSync(filename, JSON.stringify(rankdata))
            cg.global.gLog.info(`保存排行榜数据: ${filename}`)
        }
    }
    getRankItem(key:string,id:string)
    {
        let rankdata=this._checkRank(key)
        return rankdata.maps[id]
    }
    getRankItems(key:string,ids:string[])
    {
        let rankdata=this._checkRank(key)
        let result:{[id:string]:RankItem}={}
        for(let id of ids)
        {
            result[id]=rankdata.maps[id]
        }
        return result
    }
    getRankList(key:string,start:number,count:number)
    {
        let rankdata=this._checkRank(key)
        if(count<=0)
        {
            return rankdata.list
        }
        return rankdata.list.slice(start,start+count)
    }
    getRankCount(key:string)
    {
        let rankdata=this._checkRank(key)
        return rankdata.list.length
    }
    getRevRankList(key:string,start:number,count:number)
    {
        let rankdata=this._checkRank(key)
        let list = rankdata.list
        let result:RankItem[]=[]
        let k=0
        for(let i = list.length-1; i >= 0; i--) {
            if(k>=start)
            {
                result.push(list[i])
            }
            k++
            if(k>=start+count)
            {
                break
            }
        }
        return result
    }
    //覆盖
    addToRank(key:string,id:string,score:number,other:{[key:string]:any},isreplace:boolean=false)
    {
        if(!id)
        {
            return null
        }
        if(!cg.core.isNumber(score))
        {
            return null
        }
        this._checkRank(key)
        let rankitem=this.getRankItem(key,id)
        if(!rankitem)
        {
            rankitem=new RankItem()
            rankitem.id=id
        }
        if(isreplace)
        {
            rankitem.score=score
            rankitem.other=other
        }
        else
        {
            rankitem.score+=score
            for(let key in other)
            {
                rankitem.other[key]=other[key]
            }
        }
        this._ranks[key].maps[id]=rankitem
        this._ranks[key].list.push(rankitem)
        this._sortRank(key,id)
        return rankitem
    }
    //批量覆盖
    addsToRank(key:string,datas:{[id:string]:{score:number,other:{[key:string]:any}}},isreplace:boolean=false)
    {
        if(!datas)
        {
            return []
        }
        for(let id in datas)
        {
            if(!cg.core.isNumber(datas[id].score))
            {
                return []
            }
        }
        this._checkRank(key)
        let rankitems:{[id:string]:RankItem}={}
        for(let id in datas)
        {
            let rank = this.addToRank(key,id,datas[id].score,datas[id].other,isreplace)
            if(rank)
            {
                rankitems[id]=rank
            }
        }
        return rankitems
    }
    removeFromRank(key:string,id:string)
    {
        this._checkRank(key)
        let rankitem = this._ranks[key].maps[id]
        delete this._ranks[key].maps[id]
        let list = this._ranks[key].list
        let index = list.findIndex(item => item.id === id)
        if (index < 0) {
            return
        }
        // 从列表中移除当前项
        list.splice(index, 1)
        // 更新排名
        for(let i = 0; i < list.length; i++) {
            list[i].rank = i + 1
        }
        return rankitem
    }
    protected _sortRank(key:string,id:string)
    {
        let rankdata=this._checkRank(key)
        let maps=rankdata.maps
        let data=maps[id]
        if(!data)
        {
            return
        }
        let list = rankdata.list
        let index = list.findIndex(item => item.id === id)
        if (index < 0) {
            return
        }
        // 从列表中移除当前项
        list.splice(index, 1)
        
        // 插入排序 - 从高分到低分排序
        let insertIndex = 0
        for(let i = 0; i < list.length; i++) {
            if(data.score <= list[i].score) {
                insertIndex = i + 1
            } else {
                break
            }
        }
        
        // 插入到正确位置
        list.splice(insertIndex, 0, data)
        
        // 更新排名
        for(let i = 0; i < list.length; i++) {
            list[i].rank = i + 1
        }
    }
    executeCommand(key:string,commands:{[id:string]:CommandItem})
    {
        for(let id in commands)
        {
            if(!cg.core.isNumber(commands[id].score))
            {
                return []
            }
        }
        let rankdata=this._checkRank(key)
        let maps=rankdata.maps
        let list=rankdata.list
        let rankitems:RankItem[]=[]
        for(let id in commands)
        {
            let command=commands[id]
            let rankitem=maps[id]
            if(!rankitem)
            {
                rankitem=new RankItem()
                rankitem.id=id
                maps[id]=rankitem
                list.push(rankitem)
            }
            rankitem.score+=command.score
            for(let key in command.inc)
            {
                rankitem.other[key]=rankitem.other[key]||0
                rankitem.other[key]+=command.inc[key]
            }
            for(let key in command.set)
            {
                rankitem.other[key]=command.set[key]
            }
            if(command.score)
            {
                this._sortRank(key,id)
            }
            rankitems.push(rankitem)
        }
        return rankitems
    }
    protected _checkRank(key:string)
    {
        let rankdata=this._ranks[key]
        if(!rankdata)
        {
            rankdata=new RankData()
            rankdata.key=key
            this._ranks[key]=rankdata
        }
        if(rankdata.timeout>0&&Date.now()>rankdata.timeout)
        {
            this.removeRank(key)
            rankdata=this._checkRank(key)
        }
        return rankdata
    }
}

export let GRankSer = new RankService()
