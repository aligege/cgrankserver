import { FrameworkErrorCode } from "cgserver/dist/types/Framework/index_export_"

export let EErrorCode:AdminErrorCode=null
class AdminErrorCode extends FrameworkErrorCode
{
    Wrong_Param={id:60001,des:"错误的参数"}
    Token_Failed={id:6002,des:"token验证失败!"}
    Permission_Denied={id:60003,des:"权限验证失败!"}
}
EErrorCode=new AdminErrorCode()