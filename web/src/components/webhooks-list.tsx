import { useMutation, useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { WebhooksListItem } from "./webhooks-list-item";
import { webhookListSchema } from "../http/schemas/webhooks";
import { Loader2, Wand2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import * as Dialog from '@radix-ui/react-dialog'
import { CodeBlock } from "./ui/code-block";

export function WebhookList() {
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const [checkedWebhooksIds, setCheckedWebhooksIds] = useState<string[]>([]);
    const [generatedHandlerCode, setGeneratedHandlerCode] = useState<string | null>(null);

    function handleCheckWebhook(checkedWebhookId: string) {
        if (checkedWebhooksIds.includes(checkedWebhookId)) {
            setCheckedWebhooksIds(state => {
                return state.filter(webhookId => webhookId !== checkedWebhookId)
            })
        } else {
            setCheckedWebhooksIds(state => [...state, checkedWebhookId]);
        }
    }

    const hasAnyWebhookChecked = checkedWebhooksIds.length > 0;

    const generatedHandlerMutation = useMutation({
        mutationFn: async (webhookIds: string[]) => {
            const response = await fetch("http://localhost:3333/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ webhookIds }),
            });

            const data = await response.json();
            return data as { code: string };
        },
        onSuccess: (code) => {
            setGeneratedHandlerCode(code.code);
        }
    })

    const { data, hasNextPage, fetchNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery({
        queryKey: ['webhooks'],
        queryFn: async ({ pageParam }) => {
            const url = new URL('http://localhost:3333/api/webhooks');

            if (pageParam) {
                url.searchParams.set('cursor', pageParam);
            }

            const response = await fetch(url);
            const data = await response.json();

            return webhookListSchema.parse(data);
        },
        getNextPageParam: (lastPage) => {
            return lastPage.nextCursor || undefined;
        },
        initialPageParam: undefined as string | undefined,
    })

    const webhooks = data.pages.flatMap(page => page.webhooks)

    useEffect(() => {
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        observerRef.current = new IntersectionObserver(entries => {
            const entry = entries[0];

            if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        }, {
            threshold: 0.1,
        })

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current)
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    return (
        <>
            <div className="flex-1 overflow-y-auto">
                <div className="space-y-1 p-2">
                    <button
                        disabled={!hasAnyWebhookChecked || generatedHandlerMutation.isPending}
                        className="w-full rounded-lg bg-indigo-400 
                        disabled:opacity-50 flex items-center justify-center gap-3 text-sm py-2.5 font-medium"
                        onClick={() => generatedHandlerMutation.mutate(checkedWebhooksIds)}
                    >
                        {generatedHandlerMutation.isPending ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                Gerando...
                            </>
                        ) : (
                            <>
                                <Wand2 className="size-4" />Generate Handler
                            </>
                        )}
                    </button>

                    {webhooks.map(webhook => {
                        return (
                            <WebhooksListItem
                                key={webhook.id}
                                webhook={webhook}
                                onWebhookCheck={handleCheckWebhook}
                                isWebhookChecked={checkedWebhooksIds.includes(webhook.id)}
                            />

                        )
                    })}
                </div>

                {hasNextPage && (
                    <div className="p-2" ref={loadMoreRef}>
                        {isFetchingNextPage && (
                            <div className="flex items-center justify-center py-2">
                                <Loader2 className="size-5 text-zinc-500 animate-spin" />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {!!generatedHandlerCode && (
                <Dialog.Root defaultOpen={true}>
                    <Dialog.Overlay className="bg-black/60 inset-0 fixed z-20">
                        <Dialog.Content className="flex items-center justify-center fixed left-1/2 top-1/2 max-h-[65vh] w-[90vw] max-w-[500px] -translate-x-1/2 -translate-y-1/2">
                            <div className="bg-zinc-900 w-[600px] p-4 rounded-lg border border-zinc-800 max-h-[400px] overflow-y-auto">
                                <CodeBlock code={generatedHandlerCode} language="typescript" />
                            </div>
                        </Dialog.Content>
                    </Dialog.Overlay>
                </Dialog.Root>
            )}
        </>
    )
}