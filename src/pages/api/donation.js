import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import Joi from "joi";
import { db } from "@/utils/firebase";
import { doc, setDoc, updateDoc, } from "firebase/firestore";

const prisma = new PrismaClient();

export default async function handler(req, res) {
    const { method } = req;
    switch (method) {
        case "GET":
            try {
                const { institutionId } = req.query;
                if (!institutionId) throw new Error("Missing institutionId in request");

                const donations = await prisma.donation.findMany({
                    where: { institution_id: Number(institutionId) },
                    include: {
                        Campaign: {
                            select: { name: true, requirement: true } // Add the fields you want to retrieve from the Campaign
                        },
                        Benefactor: {
                            select: { name: true, email: true, lat: true, lng: true } // Add the fields you want to retrieve from the Benefactor
                        }
                    }
                });

                res.status(200).json(donations);
            } catch (error) {
                res.status(400).json({ error: error.message });
            }
            break;
        case "PUT":
            try {
                const { donationId, status } = req.body;
                if (!donationId || !status) throw new Error("Missing donationId or status in request");
            
                // Ensure the status is one of the accepted values
                if (!["to_collect", "on_the_way", "received"].includes(status)) {
                    throw new Error("Invalid status in request");
                }
            
                const donation = await prisma.donation.update({
                    where: { id: Number(donationId) },
                    data: { status: status }
                });

                console.log(donation)
            
                // Also update the status in Firestore
                const donationDoc = doc(db, "donations", donation.firebase_id.toString());
                await updateDoc(donationDoc, {
                  status: status
                });            
            
                res.status(200).json(donation);
            } catch (error) {
                res.status(400).json({ error: error.message });
            }
            break;
        default:
            res.setHeader('Allow', ['GET']);
            res.status(405).end(`Method ${method} Not Allowed`);  
    }
}