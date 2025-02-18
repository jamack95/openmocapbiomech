import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileDown, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { type Session } from "@shared/schema";

export default function SessionDetail() {
  const { id } = useParams<{ id: string }>();
  
  const { data: session, isLoading } = useQuery<Session>({
    queryKey: [`/api/sessions/${id}`],
  });

  const handleDownloadCSV = () => {
    if (!session) return;

    // Create CSV content
    const headers = ["timestamp", "leftKnee", "rightKnee", "leftHip", "rightHip", "leftElbow", "rightElbow", "leftShoulder", "rightShoulder"];
    const csvContent = [
      headers.join(","),
      ...session.jointData.map(data => {
        const timestamp = new Date(data.timestamp).toISOString();
        return [
          timestamp,
          data.angles.leftKnee,
          data.angles.rightKnee,
          data.angles.leftHip,
          data.angles.rightHip,
          data.angles.leftElbow,
          data.angles.rightElbow,
          data.angles.leftShoulder,
          data.angles.rightShoulder
        ].join(",");
      })
    ].join("\n");

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `session-${session.name}-${format(new Date(session.startTime), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <div className="p-6">Loading session data...</div>;
  }

  if (!session) {
    return <div className="p-6">Session not found</div>;
  }

  // Transform data for the chart
  const chartData = session.jointData.map(data => ({
    timestamp: new Date(data.timestamp).toLocaleTimeString(),
    ...data.angles
  }));

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Link href="/analysis">
              <Button variant="ghost" className="pl-0">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Analysis
              </Button>
            </Link>
            <h1 className="text-4xl font-bold">{session.name}</h1>
            <p className="text-muted-foreground">
              {format(new Date(session.startTime), "PPp")} · {session.type}
            </p>
          </div>
          
          <Button onClick={handleDownloadCSV}>
            <FileDown className="mr-2 h-4 w-4" />
            Download CSV
          </Button>
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Joint Angles Over Time</h2>
          <div className="w-full overflow-x-auto">
            <LineChart
              width={1000}
              height={500}
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis label={{ value: 'Angle (degrees)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="leftKnee" stroke="#8884d8" name="Left Knee" />
              <Line type="monotone" dataKey="rightKnee" stroke="#82ca9d" name="Right Knee" />
              <Line type="monotone" dataKey="leftHip" stroke="#ffc658" name="Left Hip" />
              <Line type="monotone" dataKey="rightHip" stroke="#ff7300" name="Right Hip" />
              <Line type="monotone" dataKey="leftElbow" stroke="#a4de6c" name="Left Elbow" />
              <Line type="monotone" dataKey="rightElbow" stroke="#d88484" name="Right Elbow" />
              <Line type="monotone" dataKey="leftShoulder" stroke="#8dd1e1" name="Left Shoulder" />
              <Line type="monotone" dataKey="rightShoulder" stroke="#e1b58d" name="Right Shoulder" />
            </LineChart>
          </div>
        </Card>
      </div>
    </div>
  );
}
