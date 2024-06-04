import { revalidatePath } from "next/cache";
import { CreateInvoice, UpdateInvoice } from "../ui/invoices/buttons";
import { redirect } from "next/navigation";
import { sql } from "@vercel/postgres";

export async function createInvoice(formData: FormData){
    const {customerId, amount, status } = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    try {
        await sql `
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
        `;
    } catch (error) {
        return {
            message: 'Database Error: failed to Create Invoice.'
        };
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function updateInvoice(id: string, formData: FormData) {
    const { customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    const amountIncents = amount * 100;

    try {
        await sql `
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountIncents}, status = ${status}
        WHERE id = ${id}
        `;
    } catch (error) {
        return { message : 'Database Error: failed to Update Invoice.'};
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
    // throw new Error('Failed to Delete Invoice');

    try {
        await sql `DELETE FROM invoices WHERE id = ${id}`;
        revalidatePath('/dashboard/invoices');
        return { message: 'Deleted invoices'};
    } catch (eroor) {
        return { message: 'Database Error: Failed to Delete Invoices.'}
    }
}