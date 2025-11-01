'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useTokenActions } from '@/lib/hooks/useTokenActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const burnSchema = z.object({
  amount: z.string().min(1, 'Amount is required'),
});

export function BurnForm() {
  const form = useForm<z.infer<typeof burnSchema>>({
    resolver: zodResolver(burnSchema),
    defaultValues: {
      amount: '',
    },
  });

  const { burn, refetchBalance, isPending } = useTokenActions();

  async function onSubmit(values: z.infer<typeof burnSchema>) {
    try {
      await burn(values.amount);
      toast.success('Burn submitted');
      form.reset();
      await refetchBalance();
    } catch (error) {
      console.error(error);
      toast.error('Burn failed, check console for details');
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="text-xs uppercase tracking-wide text-white/60">
          Amount (VLR)
        </label>
        <Input placeholder="25" {...form.register('amount')} />
        {form.formState.errors.amount && (
          <p className="text-xs text-rose-400">
            {form.formState.errors.amount.message}
          </p>
        )}
      </div>
      <Button type="submit" className="w-full rounded-xl" disabled={isPending} variant="destructive">
        {isPending ? 'Submitting…' : 'Burn tokens'}
      </Button>
    </form>
  );
}
