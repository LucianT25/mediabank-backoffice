'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { routes, submitData } from '@/lib/fetcher';
import { useSession } from 'next-auth/react';
import { refreshData } from '@/lib/server-actions';
import { useTranslations } from 'next-intl';

interface IflowsConfiguratorProps {
  productId: string;
  iflowsProductCode?: string;
  iflowsAdministration?: string;
}

export default function IflowsConfigurator({
  productId,
  iflowsProductCode = '',
  iflowsAdministration = '',
}: IflowsConfiguratorProps) {
  const t = useTranslations('Products.Iflows');
  const { toast } = useToast();
  const { data: session } = useSession();
  const [productCode, setProductCode] = useState(iflowsProductCode);
  const [administration, setAdministration] = useState(iflowsAdministration);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await submitData(
        `${routes.product}/${productId}`,
        (session as any)?.accessToken,
        {
          id: productId,
          iflowsProductCode: productCode || null,
          iflowsAdministration: administration || null,
        },
      );
      toast({ title: t('saved') });
      await refreshData(`${routes.product}/${productId}`);
    } catch {
      toast({ title: t('saveFailed'), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 max-w-lg">
        <p className="text-sm text-muted-foreground">{t('description')}</p>
        <div className="space-y-2">
          <Label htmlFor="iflowsProductCode">{t('productCode')}</Label>
          <Input
            id="iflowsProductCode"
            value={productCode}
            onChange={(e) => setProductCode(e.target.value)}
            placeholder={t('productCodePlaceholder')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="iflowsAdministration">{t('administration')}</Label>
          <Input
            id="iflowsAdministration"
            value={administration}
            onChange={(e) => setAdministration(e.target.value)}
            placeholder={t('administrationPlaceholder')}
          />
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? t('saving') : t('save')}
        </Button>
      </CardContent>
    </Card>
  );
}
