import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, MapPin, Trash2 } from 'lucide-react';
import guide from '@/routes/guide';

interface Tour {
    id: number;
    title: string;
}

interface TourInstance {
    id: number;
    tourTemplate?: Tour;
}

interface TripAssignment {
    id: number;
    tour: Tour | null;
    tourInstance?: TourInstance;
}

interface TripNote {
    id: number;
    title: string;
    content: string;
    created_at: string;
    trip_assignment: TripAssignment;
}

interface Props {
    notes: {
        data: TripNote[];
        links: any[];
        current_page: number;
        last_page: number;
    };
}

export default function Notes({ notes }: Props) {
    const handleDelete = (noteId: number) => {
        if (confirm('Bạn có chắc muốn xóa nhật ký này?')) {
            router.delete(`/guide/note/${noteId}`);
        }
    };

    return (
        <AppLayout>
            <Head title="Nhật ký chuyến đi" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileText className="h-6 w-6" />
                        📝 Nhật ký chuyến đi
                    </h1>
                    <p className="text-muted-foreground">
                        Tất cả nhật ký bạn đã viết trong các chuyến đi
                    </p>
                </div>

                {/* Notes List */}
                {notes.data.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-lg font-medium">Chưa có nhật ký nào</p>
                            <p className="text-muted-foreground">
                                Nhật ký bạn viết trong các chuyến đi sẽ hiển thị tại đây
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {notes.data.map((note) => (
                            <Card key={note.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{note.title}</CardTitle>
                                            <CardDescription className="flex items-center gap-1 mt-1">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(note.created_at).toLocaleDateString('vi-VN')}
                                            </CardDescription>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-700"
                                            onClick={() => handleDelete(note.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                                        {note.content}
                                    </p>
                                    {(() => {
                                        const tour = note.trip_assignment.tourInstance?.tourTemplate || note.trip_assignment.tour;
                                        if (!tour) return null;
                                        return (
                                            <Link href={guide?.trip?.detail ? guide.trip.detail(note.trip_assignment.id) : `/guide/trip/${note.trip_assignment.id}`}>
                                                <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                                                    <MapPin className="h-3 w-3 mr-1" />
                                                    {tour.title}
                                                </Badge>
                                            </Link>
                                        );
                                    })()}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {notes.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {notes.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url || '#'}
                                className={`px-3 py-1 rounded ${
                                    link.active 
                                        ? 'bg-primary text-primary-foreground' 
                                        : 'bg-muted hover:bg-muted/80'
                                } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

