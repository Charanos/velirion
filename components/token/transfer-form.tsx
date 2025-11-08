'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useTokenActions } from '@/lib/hooks/useTokenActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const transferSchema = z.object({
  recipient: z.string().min(1, 'Recipient address is required'),
  amount: z.string().min(1, 'Amount is required'),
});

export function TransferForm() {
  const form = useForm<z.infer<typeof transferSchema>>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      recipient: '',
      amount: '',
    },
  });

  const { transfer, isPending } = useTokenActions();

  async function onSubmit(values: z.infer<typeof transferSchema>) {
    try {
      const hash = await transfer(values.recipient, values.amount);
      toast.success(`Transfer submitted successfully! Transaction: ${hash.slice(0, 10)}...`);
      form.reset();
      // Balance will auto-update when transaction confirms
    } catch (error: any) {
      console.error('Transfer error:', error);
      const errorMessage = error?.message || 'Transfer failed. Please check console for details.';
      toast.error(errorMessage);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="text-xs uppercase tracking-wide text-white/60">
          Recipient
        </label>
        <Input placeholder="0x..." {...form.register('recipient')} />
        {form.formState.errors.recipient && (
          <p className="text-xs text-rose-400">
            {form.formState.errors.recipient.message}
          </p>
        )}
      </div>
      <div>
        <label className="text-xs uppercase tracking-wide text-white/60">
          Amount (VLR)
        </label>
        <Input placeholder="100" {...form.register('amount')} />
        {form.formState.errors.amount && (
          <p className="text-xs text-rose-400">
            {form.formState.errors.amount.message}
          </p>
        )}
      </div>
      <Button type="submit" className="w-full rounded-xl" disabled={isPending}>
        {isPending ? 'Submitting…' : 'Send tokens'}
      </Button>
    </form>
  );
}
