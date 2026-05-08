export interface LoginSuccessResponseJson{
    username: string
}

export interface LoginFailResponseJson{
    message: string
}

export interface productJson{
    all_product : productItem[]
}

export interface productItem{
    _id: string,
    name: string,
    user: string,
    detail: string,
    date: string,
    price: string
}

export interface productAddItem{
    name: string,
    user: string,
    detail: string,
    date: string,
    price: string
}
