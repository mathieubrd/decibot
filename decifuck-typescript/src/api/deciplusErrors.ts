export class DeciplusQuotaError extends Error{

    constructor(message?: string) {
        super(message)
        this.name= "DeciplusQuotaError"
    }
    
}

export class DeciplusRequestError extends Error{

    constructor(message?: string) {
        super(message)
        this.name= "DeciplusRequestError"
    }
    
}


export class DeciplusAlreadyBookedError extends Error{

    constructor(message?: string) {
        super(message)
        this.name= "DeciplusAlreadyBookedError"
    }
    
}

export class DeciplusApiError extends Error{

    constructor(message?: string) {
        super(message)
        this.name= "DeciplusApiError"
    }
    
}
