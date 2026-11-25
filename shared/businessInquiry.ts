import { z } from "zod";
export const businessServices = ["AI Agents & Assistants","Business Automation","Business Intelligence","Sales & Customer Management","Custom Business Platforms","System Integration","Not Sure Yet"] as const;
const optionalText = (max:number) => z.string().trim().max(max).optional().default("");
export const businessInquirySchema = z.object({
  fullName:z.string().trim().min(1).max(255),
  email:z.string().trim().email().max(320),
  phone:optionalText(100),
  businessName:z.string().trim().min(1).max(255),
  industry:optionalText(150),
  websiteUrl:optionalText(500).refine(v=>!v || /^https?:\/\/[^\s]+$/i.test(v),"Enter a valid website URL."),
  primaryGoal:z.enum(businessServices),
  stage:optionalText(150),
  deadline:optionalText(40),
  budget:optionalText(100),
  description:z.string().trim().min(1).max(5000),
  consent:z.literal(true),
  companyFax:z.string().max(0).optional().default(""),
}).strict();
export type BusinessInquiry = z.infer<typeof businessInquirySchema>;
export function toBusinessLead(data:BusinessInquiry) {
 return {fullName:data.fullName,email:data.email.toLowerCase(),phone:data.phone||null,socialHandle:null,source:"turbo-business-inquiry",status:"new_lead" as const,
 situationPreview:"[Business Inquiry] "+data.businessName+" — "+data.primaryGoal+": "+data.description.slice(0,200),
 fullSituation:JSON.stringify({businessName:data.businessName,industry:data.industry,websiteUrl:data.websiteUrl,primaryGoal:data.primaryGoal,stage:data.stage,deadline:data.deadline,budget:data.budget,description:data.description,consent:data.consent})};
}
