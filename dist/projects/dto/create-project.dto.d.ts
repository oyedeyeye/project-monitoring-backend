export declare class CreateProjectDto {
    mdaId: string;
    title: string;
    sector: string;
    lga: string;
    senatorialDistrict: string;
    locationText: string;
    startDate: string | Date;
    endDate: string | Date;
    approvedBudget: number;
    fundingSource: string;
    contractor?: string;
    status: string;
}
