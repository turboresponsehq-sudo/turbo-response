import {describe,it,expect} from "vitest";
import {businessInquirySchema,toBusinessLead} from "../shared/businessInquiry";
const valid={fullName:"Test Owner",email:"test@example.com",businessName:"Example Business",primaryGoal:"Business Automation",description:"Reduce repetitive work",consent:true};
describe("business inquiry",()=>{
 it("maps business input to existing lead storage without case classification",()=>{const lead=toBusinessLead(businessInquirySchema.parse(valid));expect(lead.source).toBe("turbo-business-inquiry");expect(lead.status).toBe("new_lead");expect(lead).not.toHaveProperty("caseType");expect(JSON.parse(lead.fullSituation).businessName).toBe("Example Business");});
 it("rejects invalid email, missing consent, honeypot and injected case fields",()=>{for(const bad of [{...valid,email:"bad"},{...valid,consent:false},{...valid,companyFax:"spam"},{...valid,caseType:"offense"}])expect(businessInquirySchema.safeParse(bad).success).toBe(false);});
});
