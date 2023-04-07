import { Canvas } from 'datocms-react-ui';
import { RenderItemFormOutletCtx } from 'datocms-plugin-sdk';
import { useEffect } from 'react';
import { buildClient } from '@datocms/cma-client-browser';
import { Parameters } from './ConfigScreen';

type PropTypes = {
  ctx: RenderItemFormOutletCtx;
};

export default function PublishOnSave({ ctx }: PropTypes) {

  const parameters = ctx.plugin.attributes.parameters as Parameters;
  const draftMode = ctx.itemType.attributes.draft_mode_active
  const itemStatus = ctx.itemStatus;

  useEffect(() => {

    if (!ctx.currentUserAccessToken) return

    const isPublished = itemStatus === 'published'
    const isUpdated = itemStatus === 'draft' || ctx.itemStatus === 'updated'
    const client = buildClient({ apiToken: ctx.currentUserAccessToken as string })

    const confirm = async () => {

      if (!parameters.alertOnSave) return true

      return await ctx.openConfirm({
        title: 'Save and publish?',
        content: '',
        cancel: { label: 'Cancel', value: false },
        choices: [
          { label: 'Yes, publish now', value: true, intent: 'negative' },
        ],
      });
    }

    const publishItem = async () => {
      //@ts-ignore
      if (itemStatus === 'publishing') return

      const confirmed = await confirm()

      if (confirmed) {
        ctx.notice(!parameters.alertOnSave ? 'Auto-Publishing record...' : 'Publishing record...')
        try {
          await client.items.publish(ctx.item?.id as string, { recursive: true })
        } catch (e) {
          ctx.notice('Error publishing record')
        }
      }
    }

    if (draftMode && !isPublished && isUpdated)
      publishItem()

  }, [itemStatus, draftMode, parameters.alertOnSave])

  return null
}