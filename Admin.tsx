import { useState, useEffect } from 'react';
import {
  adminGetSpills,
  adminGetPrivateMessages,
  adminGetPriorityConfessions,
  adminGetUsers,
  adminGetMatchmaking,
  addTherapistResponse,
  respondToPriorityConfession,
  adminReplyPrivate,
  updateMatchmakingStatus,
} from '@/lib/api';
import { Spill, PriorityConfession, User, MatchmakingRequest } from '@/lib/storage';
import { Loader2, MessageSquare, Star, Users, Globe, Heart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AudioPlayer } from '@/components/AudioPlayer';
import { timeAgo } from '@/lib/utils';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem('fms_admin') === 'therapist2024');
  const [password, setPassword] = useState('');
  const [spills, setSpills] = useState<Spill[]>([]);
  const [privateMsgs, setPrivateMsgs] = useState<any[]>([]);
  const [priorityConfessions, setPriorityConfessions] = useState<PriorityConfession[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [matchmaking, setMatchmaking] = useState<MatchmakingRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (isAuthenticated) loadData(); }, [isAuthenticated]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, p, pc, u, m] = await Promise.all([
        adminGetSpills(),
        adminGetPrivateMessages(),
        adminGetPriorityConfessions(),
        adminGetUsers(),
        adminGetMatchmaking(),
      ]);
      setSpills(s);
      setPrivateMsgs(p);
      setPriorityConfessions(pc);
      setUsers(u);
      setMatchmaking(m);
    } catch { setError('Failed to load admin data'); }
    finally { setLoading(false); }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'therapist2024') { sessionStorage.setItem('fms_admin', 'therapist2024'); setIsAuthenticated(true); }
    else setError('Invalid password');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-card border border-accent p-8 rounded-2xl w-full max-w-sm space-y-4">
          <h1 className="font-serif text-2xl text-primary text-center">Therapist Login</h1>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-background border border-accent/40 rounded-xl px-4 py-2" placeholder="Enter password" autoFocus data-testid="input-admin-password" />
          <button className="w-full bg-primary text-accent py-2 rounded-xl font-serif" data-testid="button-admin-login">Enter</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-accent p-4 flex justify-between items-center">
        <h1 className="font-serif text-xl">Admin Dashboard</h1>
        <button onClick={loadData} disabled={loading} className="p-2 text-sm">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Refresh'}
        </button>
      </header>

      <main className="p-4 max-w-4xl mx-auto">
        <Tabs defaultValue="spills" className="w-full">
          <TabsList className="grid grid-cols-5 mb-8 text-xs">
            <TabsTrigger value="spills"><Globe className="w-3 h-3 mr-1" />Spills</TabsTrigger>
            <TabsTrigger value="private"><MessageSquare className="w-3 h-3 mr-1" />Private</TabsTrigger>
            <TabsTrigger value="priority"><Star className="w-3 h-3 mr-1" />Priority</TabsTrigger>
            <TabsTrigger value="matchmaking" data-testid="admin-tab-matchmaking"><Heart className="w-3 h-3 mr-1" />Matchmaking</TabsTrigger>
            <TabsTrigger value="users"><Users className="w-3 h-3 mr-1" />Users</TabsTrigger>
          </TabsList>

          <TabsContent value="spills" className="space-y-4">
            {spills.length === 0 ? <p className="text-sm text-center text-muted-foreground py-8">No spills yet.</p> : spills.map(s => <SpillAdminCard key={s.id} spill={s} onUpdate={loadData} />)}
          </TabsContent>

          <TabsContent value="private" className="space-y-4">
            {privateMsgs.length === 0 ? <p className="text-sm text-center text-muted-foreground py-8">No private messages yet.</p> : privateMsgs.map((chat, idx) => <PrivateChatAdminCard key={idx} chat={chat} onUpdate={loadData} />)}
          </TabsContent>

          <TabsContent value="priority" className="space-y-4">
            {priorityConfessions.length === 0 ? <p className="text-sm text-center text-muted-foreground py-8">No priority confessions yet.</p> : priorityConfessions.map(c => <PriorityAdminCard key={c.id} confession={c} onUpdate={loadData} />)}
          </TabsContent>

          <TabsContent value="matchmaking" className="space-y-4">
            {matchmaking.length === 0 ? (
              <p className="text-sm text-center text-muted-foreground py-8">No matchmaking requests yet.</p>
            ) : (
              matchmaking.map(req => <MatchmakingAdminCard key={req.id} request={req} onUpdate={loadData} />)
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-3 text-left">Email</th>
                      <th className="p-3 text-left">Sister Name</th>
                      <th className="p-3 text-left">Plan</th>
                      <th className="p-3 text-left">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b">
                        <td className="p-3 text-xs">{u.email}</td>
                        <td className="p-3 text-xs">{u.sisterName}</td>
                        <td className="p-3 text-xs font-semibold uppercase">{u.plan}</td>
                        <td className="p-3 text-xs text-muted-foreground">{timeAgo(u.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function SpillAdminCard({ spill, onUpdate }: { spill: Spill; onUpdate: () => void }) {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async () => {
    if (!response.trim()) return;
    setLoading(true);
    await addTherapistResponse(spill.id, response);
    setLoading(false); setResponse(''); onUpdate();
  };
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium">{spill.sisterName} · {spill.category}</CardTitle>
          <span className="text-[10px] text-muted-foreground">{timeAgo(spill.timestamp)}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {spill.voiceBlob ? <AudioPlayer src={spill.voiceBlob} /> : <p className="text-sm">{spill.text}</p>}
        {spill.therapistResponse ? (
          <div className="bg-accent/10 p-3 rounded-lg border border-accent/20">
            <p className="text-[10px] font-bold text-accent uppercase mb-1">Response</p>
            <p className="text-sm italic">"{spill.therapistResponse.text}"</p>
          </div>
        ) : (
          <div className="flex gap-2">
            <textarea value={response} onChange={e => setResponse(e.target.value)} placeholder="Write therapist response..." className="flex-1 bg-muted border border-accent/20 rounded-lg p-2 text-sm h-20 resize-none" />
            <button onClick={handleSubmit} disabled={loading || !response.trim()} className="bg-primary text-accent px-4 py-2 rounded-lg text-sm self-end disabled:opacity-40">{loading ? '...' : 'Respond'}</button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PrivateChatAdminCard({ chat, onUpdate }: { chat: any; onUpdate: () => void }) {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async () => {
    if (!response.trim()) return;
    setLoading(true);
    await adminReplyPrivate(chat.userEmail, response);
    setLoading(false); setResponse(''); onUpdate();
  };
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{chat.userEmail}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="max-h-60 overflow-y-auto space-y-2 p-2 bg-muted rounded-lg">
          {chat.messages.map((m: any) => (
            <div key={m.id} className={`flex flex-col ${m.sender === 'user' ? 'items-start' : 'items-end'}`}>
              <div className={`max-w-[80%] p-2 rounded-lg text-xs ${m.sender === 'user' ? 'bg-background' : 'bg-primary text-accent'}`}>{m.text}</div>
              <span className="text-[9px] text-muted-foreground mt-1">{timeAgo(m.timestamp)}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={response} onChange={e => setResponse(e.target.value)} placeholder="Reply to user..." className="flex-1 bg-muted border border-accent/20 rounded-lg p-2 text-sm" />
          <button onClick={handleSubmit} disabled={loading || !response.trim()} className="bg-primary text-accent px-4 py-2 rounded-lg text-sm disabled:opacity-40">{loading ? '...' : 'Send'}</button>
        </div>
      </CardContent>
    </Card>
  );
}

function PriorityAdminCard({ confession, onUpdate }: { confession: PriorityConfession; onUpdate: () => void }) {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async () => {
    if (!response.trim()) return;
    setLoading(true);
    await respondToPriorityConfession(confession.id, response);
    setLoading(false); setResponse(''); onUpdate();
  };
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium">{confession.sisterName}</CardTitle>
          <span className="text-[10px] text-muted-foreground">{timeAgo(confession.timestamp)}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm">{confession.text}</p>
        {confession.therapistResponse ? (
          <div className="bg-accent/10 p-3 rounded-lg border border-accent/20">
            <p className="text-[10px] font-bold text-accent uppercase mb-1">Priority Response</p>
            <p className="text-sm italic">"{confession.therapistResponse.text}"</p>
          </div>
        ) : (
          <div className="flex gap-2">
            <textarea value={response} onChange={e => setResponse(e.target.value)} placeholder="Write priority response..." className="flex-1 bg-muted border border-accent/20 rounded-lg p-2 text-sm h-20 resize-none" />
            <button onClick={handleSubmit} disabled={loading || !response.trim()} className="bg-primary text-accent px-4 py-2 rounded-lg text-sm self-end disabled:opacity-40">{loading ? '...' : 'Respond'}</button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MatchmakingAdminCard({ request, onUpdate }: { request: MatchmakingRequest; onUpdate: () => void }) {
  const [notes, setNotes] = useState(request.adminNotes ?? '');
  const [status, setStatus] = useState(request.status);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    await updateMatchmakingStatus(request.id, status, notes);
    setLoading(false);
    onUpdate();
  };

  const statusBadge: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    matched: 'bg-green-100 text-green-800',
    closed:  'bg-gray-100 text-gray-600',
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <CardTitle className="text-sm font-medium">{request.sisterName} · {request.userEmail}</CardTitle>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest ${statusBadge[request.status]}`}>{request.status}</span>
        </div>
        <p className="text-[10px] text-muted-foreground">{timeAgo(request.createdAt)}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div><span className="font-semibold text-foreground">Age:</span> {request.ageRange}</div>
          <div><span className="font-semibold text-foreground">Location:</span> {request.location}</div>
        </div>
        <div>
          <p className="text-xs font-semibold mb-1">Interests</p>
          <p className="text-sm">{request.interests}</p>
        </div>
        {request.dealbreakers && (
          <div>
            <p className="text-xs font-semibold mb-1">Dealbreakers</p>
            <p className="text-sm">{request.dealbreakers}</p>
          </div>
        )}
        <div>
          <p className="text-xs font-semibold mb-1">Bio</p>
          <p className="text-sm">{request.bio}</p>
        </div>

        <div className="border-t border-accent/20 pt-3 space-y-3">
          <div className="flex gap-2 items-center">
            <label className="text-xs font-medium text-muted-foreground">Status:</label>
            <select value={status} onChange={e => setStatus(e.target.value as any)} className="flex-1 bg-muted border border-accent/20 rounded-lg px-3 py-1.5 text-sm">
              <option value="pending">Pending</option>
              <option value="matched">Matched</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes to send to the Sister (visible to user)..." className="w-full bg-muted border border-accent/20 rounded-lg p-2 text-sm h-16 resize-none" />
          <button onClick={handleUpdate} disabled={loading} className="w-full bg-primary text-accent py-2 rounded-lg text-sm font-medium disabled:opacity-40 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Request'}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
