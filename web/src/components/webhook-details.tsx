import { useSuspenseQuery } from "@tanstack/react-query"
import { webhooksDetailsSchema } from "../http/schemas/webhooks"
import { SectionTitle } from "./section-title";
import { SectionDataTable } from "./section-data-table";
import { WebhookDetailHeader } from "./webhook-detail-header";
import { CodeBlock } from "./ui/code-block";

interface WebhookDetailsProps {
    id: string;
}

export function WebhookDetails({ id }: WebhookDetailsProps) {
    const { data } = useSuspenseQuery({
        queryKey: ['webhook', id],
        queryFn: async () => {
            const response = await fetch(`http://localhost:3333/api/webhooks/${id}`)
            const data = await response.json()
            return webhooksDetailsSchema.parse(data)
        }
    })

    const overviewData = [
        { key: 'Method', value: data.method },
        { key: 'Status Code', value: String(data.statusCode) },
        { key: 'Content-Type', value: data.contentType || 'application/json' },
        { key: 'Content-Length', value: String(data.contentLength || 0) + ' bytes' },
    ]

    const headers = Object.entries(data.headers).map(([key, value]) => {
        return { key, value: String(value) }
    })

    const queryParams = Object.entries(data.queryParams || {}).map(([key, value]) => {
        return { key, value: String(value) }
    })

    return (
        <div className='flex h-full flex-col'>
            <WebhookDetailHeader
                method={data.method}
                pathname={data.pathname}
                ip={data.ip}
                createdAt={data.createdAt}
            />
            <div className='flex-1 overflow-y-auto'>
                <div className='space-y-6 p-6'>
                    <div className='space-y-4'>
                        <SectionTitle>Request Overview</SectionTitle>
                        <SectionDataTable data={overviewData} />
                    </div>

                    <div className='space-y-4'>
                        <SectionTitle>Headers</SectionTitle>
                        <SectionDataTable data={headers} />
                    </div>

                    {queryParams.length > 0 && (
                        <div className='space-y-4'>
                            <SectionTitle>Query Parameters</SectionTitle>
                            <SectionDataTable data={queryParams} />
                        </div>
                    )}

                    {!!data.body && (
                        <div className="space-y-4">
                            <SectionTitle>Request Body</SectionTitle>
                            <CodeBlock
                                code={JSON.stringify(
                                    typeof data.body === 'string' ? JSON.parse(data.body) : data.body,
                                    null,
                                    2
                                )}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}