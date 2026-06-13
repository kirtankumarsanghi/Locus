// ─── Start server ─────────────────────────────────────────────────────────────

httpServer.listen(PORT, () => {
  console.log(`🟢 Locus backend running on http://localhost:${PORT}`);
  console.log(`🔌 Socket.IO server ready for real-time connections`);
  console.log(`   Endpoints:`);
  console.log(`     GET  /api/desks          - List all desks`);
  console.log(`     GET  /api/desks/:id      - Get desk details`);
  console.log(`     POST /api/check-in       - Check into a desk`);
  console.log(`     POST /api/away           - Mark as away`);
  console.log(`     POST /api/here           - Return from away`);
  console.log(`     POST /api/reset          - Staff reset desk`);
  console.log(`     POST /api/end-session    - Staff end session`);
  console.log(`     POST /api/checkout       - Student checkout`);
  console.log(`     GET  /api/analytics      - Usage stats`);
  console.log(`     GET  /api/health         - Health check`);
});
