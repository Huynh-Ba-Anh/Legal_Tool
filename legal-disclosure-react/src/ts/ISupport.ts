export interface ISupport {
    _id: string;
    phone: string;
    message: string;
    cccd: string;
    personName: string;
    typePerson: string;
    currentObligation: string;
    status: "pending" | "processing" | "done";
}
