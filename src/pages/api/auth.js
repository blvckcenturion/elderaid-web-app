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
        case "GET":
            try {
                // extract token from Authorization header
                const token = req.headers.authorization.split(' ')[1];
                // verify and decode the token
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await prisma.institution.findUnique({ where: { id: decoded.id } });
                if (!user) throw new Error("User not found");
                res.status(200).json(user);
            } catch (error) {
                res.status(400).json({ error: error.message });
            }
            break;
        case "POST":
            try {
                // Validate request body
                const schema = Joi.object({
                    name: Joi.string().required(),
                    NIT: Joi.string().required(),
                    main_representative: Joi.string().required(),    
                    email: Joi.string().email().required(),
                    phone: Joi.string().required(),
                    address: Joi.string().required(),
                    lat: Joi.number().required(),
                    lng: Joi.number().required(),
                    password: Joi.string().required(),
                    image_url: Joi.string().required(),
                });

                const { error } = schema.validate(req.body);
                console.log(error)
                if (error) throw error;

                const { name, email, password, NIT, main_representative, phone, address, lat, lng, image_url } = req.body;

                // Check if user already exists
                const existingUser = await prisma.institution.findUnique({ where: { email } });
                if (existingUser) throw new Error("User already exists");

                // Hash password
                const hashedPassword = await bcrypt.hash(password, 10);
                // Create new user
                const newUser = await prisma.institution.create({
                    data: {
                        name,
                        email,
                        password: hashedPassword,
                        NIT,
                        main_representative,
                        phone,
                        address,
                        lat,
                        lng,
                        image_url
                    },
                });
        
                // Create a document in Firestore in the 'institutions' collection with the id of the newly created user
                const institutionDoc = doc(db, "institutions", newUser.id.toString());
        
                // Set the document with the required details
                await setDoc(institutionDoc, {
                    name: newUser.name,
                    NIT: newUser.NIT,
                    phone: newUser.phone,
                    address: newUser.address,
                    lat: newUser.lat,
                    lng: newUser.lng,
                    image_url: newUser.image_url,
                    id: newUser.id
                });
        
                // Generate JWT
                const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: '1w' });
        
                // Send back token
                res.status(200).json({ token });
            } catch (error) {
                console.log(error)
        
                res.status(400).json({ error: error.message });
            }
            break;
        case "PUT":
            try {
                // Validate request body
                const schema = Joi.object({
                  email: Joi.string().email().required(),
                  password: Joi.string().min(6).required(),
                });
        
                const { error } = schema.validate(req.body);
                if (error) throw error;
        
                const { email, password } = req.body;
        
                // Check if user exists
                const user = await prisma.institution.findUnique({ where: { email } });
                if (!user) throw new Error("User not found");
        
                // Verify password
                const validPassword = await bcrypt.compare(password, user.password);
                if (!validPassword) throw new Error("Invalid password");
        
                // Generate JWT
                const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1w' });
        
                // Send back token
                res.status(200).json({ token });
            } catch (error) {
                res.status(400).json({ error: error.message });
            }
            break;
        default:
            res.setHeader("Allow", ["POST", "PUT"]);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}