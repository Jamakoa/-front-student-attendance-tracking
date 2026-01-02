
export interface DeviceUser {
    employeeNo: string;
    name: string;
    gender: 'male' | 'female' | 'unknown';
    numOfCard: number;
    numOfFP: number;
    numOfFace: number;
    enable: boolean;
    beginTime: string;
    endTime: string;
}