interface Experience {
    business?: string;
    current?: boolean;
    duration?: number;
    id?: string;
    job?: string;
    jobTitle?: string;
    industry?: number;
    occupation?: number;
    startMonth?: Month;
    startYear?: string;
    isCustom?: boolean;
  }
  
  type Month = 'January' | 'February' | 'March' | 'April' | 'May' | 'June' | 'July' | 'August' | 'September' | 'October' | 'November' | 'December';

interface Education {
    id: string;
    schoolName: string;
    city?: string;
    degree: Degree;
    otherDegree?: string;
    fieldOfStudy?: string;
    status: Status;
    endDate?: {
      month: Month;
      year: string;
    };
  }

type Degree = 'EDUCATION_LEVEL_ELEMENTARY' | 'EDUCATION_LEVEL_HIGH_SCHOOL' | 'EDUCATION_LEVEL_COLLEGE' | 'EDUCATION_LEVEL_UNIVERSITY' | 'EDUCATION_LEVEL_TRAINING' | 'EDUCATION_LEVEL_CERTIFICATION' | 'EDUCATIONa_LEVEL_OTHERS';

type Status = 'ongoing' | 'completed' | 'dropout';

// Final output json should only output ResponseRequired formatted json
export interface ResponseRequired {
    experiences?: Experience[];
    educations?: Education[];
    titles?:string[]
}