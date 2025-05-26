import { RESEND_API_KEY } from '$env/static/private';
import { OtpSessionManager } from '$lib/server/sessionManager';
import { supabase } from '$lib/supabaseClient';
import type { Actions } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";
import bcrypt from "bcryptjs";
import { Resend } from 'resend';
import { message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { UserDbSchema } from '../(app)/home/request-user-schema';
import { registerSchema, type UserRegistration } from "./register-schema";

export const load = async () => {
    const form = await superValidate(zod(registerSchema))
    return {
        form
    }
}

export const actions: Actions = {
    register: async ({ request, cookies }) => {
        // validasi form dengan library superform
        const form = await superValidate(request, zod(registerSchema));
        if (!form.valid) {
            return message(form, { message: "Invalid Form" })
        }

        // cari user dari db menggunakan email
        const userDbResponse = await supabase.from("user_credentials").select("*").eq("email", form.data.email);
        const userDb: UserDbSchema[] = JSON.parse(JSON.stringify(userDbResponse.data))
        if (userDb.length > 0) {
            return fail(400, { data: form, message: "User Exist" });
        }

        // cek jika username ada di db, maka throw error
        const sameUsernameResponse = await supabase.from("user_credentials").select("username").eq("username", form.data.username);
        const sameUsername: string = JSON.parse(JSON.stringify(sameUsernameResponse.data));
        if (sameUsername.length > 0) {
            return fail(400, { data: form, message: "Username Exist" })
        }

        // buat kode OTP secara random (6 digit)
        const otp: number = Math.floor(Math.random() * (999999 - 100000) + 100000);

        // ambil NIM dari student email (kalau email yang dimasukkan student email)
        const NIM = form.data.email.split("@")[0];
        const emailType = form.data.email.split(".")[0].split("@")[1];

        // ambil kode jurusan dari huruf ke 3 sampai ke 5
        const majorCode = NIM.substring(2, 5);
        let majorCodeFromInput: string = '';
        let roleCode: string = '';
        if (majorCode == "082") {
            majorCodeFromInput = 'INF'; // Informatics
        }
        else if (majorCode == "081") {
            majorCodeFromInput = 'IS'; // IS
        }
        else if (majorCode == "011") {
            majorCodeFromInput = 'MGT' // MGT
        }
        else if (majorCode == "012") {
            majorCodeFromInput = 'ACC' // ACC
        }
        else if (majorCode == "013") {
            majorCodeFromInput = 'HOS' // HOS
        }
        else if (majorCode == "051") {
            majorCodeFromInput = 'LAW' // LAW
        }

        if (emailType == "student") {
            roleCode = 'STD';
        }
        else {
            roleCode = 'STF';
            majorCodeFromInput = 'UNV';
        }

        if (roleCode == '' || majorCodeFromInput == '') {
            return fail(400, { data: form, message: "Invalid Input, Please Check Again" });
        }

        if ( roleCode == 'STD' && NIM.length > 11) {
            return fail(400, { data: form, message: "Please Enter a valid Student Number" });
        }

        const roleIdResponse = (await supabase.from("role_db").select("id").eq("code", roleCode));
        if (roleIdResponse.error || roleIdResponse.data.length == 0) {
            throw fail(400, { message: "Role Not Found... Please Check Role Master Data" });
        }

        const majorIdResponse = (await supabase.from("major_db").select("id").eq("code", majorCodeFromInput));
        if (majorIdResponse.error || majorIdResponse.data.length == 0) {
            throw fail(400, { message: "Role Not Found... Please Check Role Master Data" });
        }

        const pass = await bcrypt.hash(form.data.password, 15)
        const userRegistration: UserRegistration = {
            email: form.data.email.trim(),
            username: form.data.username,
            password: pass,
            otp: otp.toString(),
            majorId:majorIdResponse.data[0].id,
            roleId:roleIdResponse.data[0].id
        }

        // simpan data registrasi sementara di session
        const otpResponse = await OtpSessionManager.createSession(cookies, userRegistration, form.data.email.toString());
        if (otpResponse.error) {
            console.log(otpResponse.message);
            return fail(400, { data: form });
        }

        // send email jika semua validasinya berhasil
        const resend = new Resend(RESEND_API_KEY);
        // TODO: to -> form.data.email
        const response = await resend.emails.send({
            from: "no-reply@uph-academic-services.web.id",
            to: "kelvinrogue6@gmail.com",
            subject: "Confirm Registration",
            html: `<p>Complete your Registration with Given Code. \n OTP : ${otp}</p>`
        })
        console.log(response.error);

        return message(form, "Complete Your Registration");
    }
} satisfies Actions;
