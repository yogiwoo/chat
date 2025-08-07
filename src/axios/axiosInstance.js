let chat="http://localhost:6006"
let {token}=localStorage.getItem('userData')
export default async function getApi(api){
    try{
    let data=await axios.post(`${chat}/${api}`)
    if(data){
        console("===========================>",data)
        return data
    }
    else{
        return null
    }
}catch(err){
    return err
}
}

export default function post(){

}

export default function put(){

}