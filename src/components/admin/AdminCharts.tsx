"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

interface ActivityData {
  date: string;
  users: number;
  posts: number;
}

interface TagData {
  name: string;
  count: number;
}

interface CategoryData {
  name: string;
  value: number;
}

const COLORS = ["#3b82f6", "#a855f7", "#ec4899", "#ef4444", "#f59e0b", "#10b981", "#06b6d4"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a1a] border border-white/10 p-3 rounded-lg shadow-xl backdrop-blur-md">
        <p className="text-white/40 text-xs mb-1 uppercase tracking-wider">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-bold" style={{ color: entry.color || entry.fill }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function ChartWrapper({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="w-full h-full bg-white/5 animate-pulse rounded-lg" />;

  return <>{children}</>;
}

export function ActivityChart({ data }: { data: ActivityData[] }) {
  return (
    <ChartWrapper>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#ffffff40', fontSize: 12 }}
            tickFormatter={(val) => val.split('-').slice(1).join('/')}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#ffffff40', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
          <Area 
            type="monotone" 
            dataKey="users" 
            name="신규 사용자"
            stroke="#3b82f6" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorUsers)" 
          />
          <Area 
            type="monotone" 
            dataKey="posts" 
            name="새 게시물"
            stroke="#a855f7" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorPosts)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

export function TagChart({ data }: { data: TagData[] }) {
  return (
    <ChartWrapper>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={false} />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#ffffff80', fontSize: 12 }}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} isAnimationActive={false} />
          <Bar dataKey="count" name="사용 횟수" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

export function DistributionChart({ data, title }: { data: CategoryData[], title: string }) {
  return (
    <div className="h-full w-full flex flex-col">
      <h4 className="text-sm font-medium text-white/40 mb-4 px-6">{title}</h4>
      <div className="flex-1">
        <ChartWrapper>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span className="text-xs text-white/60">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </div>
    </div>
  );
}
