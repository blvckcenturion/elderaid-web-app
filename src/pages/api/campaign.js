import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Joi from "joi";
import { db } from "@/utils/firebase";
import { doc, setDoc } from "firebase/firestore";

const prisma = new PrismaClient();

export default async function handler(req, res) {
    const { method } = req;
    switch (method) {
        case "POST":
            try {
                const schema = Joi.object({
                    name: Joi.string().required(),
                    requirement: Joi.string().required(),
                    beneficiary_type: Joi.string().required(),
                    start_date: Joi.date().required(),
                    end_date: Joi.date().required(),
                    image_urls: Joi.array().items(Joi.string().uri()).required(),
                });
                
                const { error } = schema.validate(req.body);
                if (error) throw error;
            
                // Extracting token from authorization header
                const token = req.headers.authorization.split(' ')[1];
                // Decoding the JWT token
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
                // Getting the institution_id from decoded JWT token
                const institution_id = decoded.id;
            
                const { name, requirement, beneficiary_type, start_date, end_date, image_urls } = req.body;
            
                const newCampaign = await prisma.campaign.create({
                    data: {
                        name,
                        requirement,
                        beneficiary_type,
                        start_date: new Date(start_date),  // convert string to Date
                        end_date: new Date(end_date),      // convert string to Date
                        institution_id,
                        // Create CampaignImage records for each image_url
                        CampaignImages: {
                            create: image_urls.map(image_url => ({ image_url })),
                        },
                    },
                    include: {
                        CampaignImages: true,
                    },
                });

                const campaignDoc = doc(db, "campaigns", newCampaign.id.toString())
                
                await setDoc(campaignDoc, {
                    name: newCampaign.name,
                    requirement: newCampaign.requirement,
                    beneficiary_type: newCampaign.beneficiary_type,
                    start_date: new Date(newCampaign.start_date),
                    end_date: new Date(newCampaign.end_date),
                    institution_id: newCampaign.institution_id,
                    campaign_images: newCampaign.CampaignImages
                })
                res.status(201).json(newCampaign);
            } catch (error) {
                console.log(error)
                res.status(400).json({ error: error.message });
            }
            break;
        case "GET":
            try {
                const { id, institutionId } = req.query;
                if (id) {
                    // Fetch single campaign
                    const campaign = await prisma.campaign.findUnique({
                        where: { id: parseInt(id, 10) },
                        include: { CampaignImages: true }
                    });
                
                    if (!campaign) {
                        res.status(404).json({ message: "Campaign not found" });
                    } else {
                        res.status(200).json(campaign);
                    }
                } else if (institutionId && !id) {
                    const campaigns = await prisma.campaign.findMany({
                        where: {
                            institution_id: parseInt(institutionId)
                        },
                        include: { CampaignImages: true }
                    })
                    res.status(200).json(campaigns);
                } else {
                    // Fetch all campaigns
                    const campaigns = await prisma.campaign.findMany({
                        include: { CampaignImages: true, Institution: true }
                    });
                    res.status(200).json(campaigns);
                }
            } catch (error) {
                res.status(400).json({ error: error.message });
            }
            break;
        case "DELETE":
            try {
                const { id } = req.query;
                const token = req.headers.authorization.split(" ")[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await prisma.institution.findUnique({ where: { id: decoded.id } });
                if (!user) throw new Error("User not found");
                
                // Delete associated CampaignImage records first
                await prisma.campaignImage.deleteMany({
                    where: {
                        campaign_id: parseInt(id)
                    }
                });
        
                // Then delete the Campaign
                await prisma.campaign.delete({ where: { id: parseInt(id) } });
                res.status(200).json({ message: "Campaign deleted successfully." });
            } catch (error) {
                console.log(error)
                res.status(400).json({ error: error.message });
            }
            break;            
        case "PUT":
            // Close/Update Campaign (JWT protected)
            try {
            const { id, status } = req.body;
            const token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await prisma.institution.findUnique({ where: { id: decoded.id } });
            if (!user) throw new Error("User not found");
    
            const updatedCampaign = await prisma.campaign.update({
                where: { id },
                data: { status },
            });
            res.status(200).json(updatedCampaign);
            } catch (error) {
            res.status(400).json({ error: error.message });
            }
            break;
        default:
            res.setHeader("Allow", ["POST", "GET", "DELETE", "PUT"]);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
  }