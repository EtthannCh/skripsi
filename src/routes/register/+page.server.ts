import { GOOGLE_EMAIL, GOOGLE_PASSWORD } from '$env/static/private';
import { OtpSessionManager } from '$lib/server/sessionManager';
import { supabase } from '$lib/supabaseClient';
import type { Actions } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { registerSchema, type UserRegistration } from "./register-schema";
import type { UserDbSchema } from '../(app)/home/request-user-schema';

export const load = async () => {
    const form = await superValidate(zod(registerSchema))
    return {
        form
    }
}

export const actions: Actions = {
    register: async ({ request, cookies }) => {
        const reqForm = await request.formData();
        const form = await superValidate(reqForm, zod(registerSchema));
        if (!form.valid) {
            return fail(400, {
                data: form,
                message: "Invalid Form"
            })
        }

        const userDbResponse = await supabase.from("user_credentials").select("*").eq("email", form.data.email);
        const userDb: UserDbSchema[] = JSON.parse(JSON.stringify(userDbResponse.data))
        if (userDb.length > 0) {
            return fail(400, { data: form, message: "User Exist" });
        }

        const otp: number = Math.floor(Math.random() * (999999 - 100000) + 100000);
        const NIM = form.data.email.split("@")[0];
        const emailType = form.data.email.split(".")[0].split("@")[1];
        const majorCode = NIM.substring(2, 5);
        let majorId: number = 0;
        let roleId: number = 0;
        if (majorCode == "082") {
            majorId = 1; // Informatics
        }
        else if (majorCode == "081") {
            majorId = 2; // IS
        }
        else if (majorCode == "011") {
            majorId = 3 // MGT
        }
        else if (majorCode == "012") {
            majorId = 6 // ACC
        }
        else if (majorCode == "013") {
            majorId = 4 // HOS
        }
        else if (majorCode == "051") {
            majorId = 5 // LAW
        }

        if (emailType == "student") {
            roleId = 3;
        }
        else {
            roleId = 5
        }

        if (roleId == 0 || majorId == 0) {
            return fail(400, { data: form, message: "Invalid Input, Please Check Again" });
        }

        if (roleId == 3 && NIM.length > 11) {
            return fail(400, { data: form, message: "Please Enter a valid Student Number" });
        }

        const pass = await bcrypt.hash(form.data.password, 15)
        const userRegistration: UserRegistration = {
            email: form.data.email.trim(),
            username: form.data.username,
            password: pass,
            otp: otp.toString(),
            majorId,
            roleId
        }
        const otpResponse = await OtpSessionManager.createSession(cookies, userRegistration, form.data.email.toString());
        if (otpResponse.error) {
            console.log(otpResponse.message);
            return fail(400, { data: form });
        }

        sendEmail("kelvinrogue6@gmail.com", "Confirm Registration", `Complete your Registration with Given Code. \n OTP : ${otp}`);
        return message(form, "Complete Your Registration");
    }
} satisfies Actions;

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: GOOGLE_EMAIL,
        pass: GOOGLE_PASSWORD
    }
})

const sendEmail = async (to: string, subject: string, text: string) => {
    const mailOptions = {
        from: GOOGLE_EMAIL,
        to,
        subject,
        text
    }
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email Sent", info.response);
    } catch (error) {
        console.log(error);
    }
}