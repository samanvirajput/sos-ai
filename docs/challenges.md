# Challenges

## Balancing safety detection sensitivity
Overly aggressive crisis detection flags normal expressions of sadness
("I'm exhausted") as crisis events, breaking conversational flow and
eroding trust. Too permissive and genuinely at-risk users get a standard
response. Solution: three-tier classification (safe / warning / crisis)
with distinct response strategies per tier. Warning-tier responses
acknowledge distress and gently surface resources without triggering
the full crisis protocol.

## RLS with dynamic user context
PostgreSQL RLS requires the current user ID to be set as a session
variable (SET app.current_user_id = '...') before each query. This
does not compose naturally with connection pooling -- a pooled connection
might carry a previous user's session variable. Solution: the database
middleware sets the session variable at the start of every request and
clears it after, ensuring isolation even under pooling.

## Emotion model cold start
Loading j-hartmann/emotion-english-distilroberta-base on first request
adds ~2.8 seconds to the first inference. Solution: model is loaded
eagerly at application startup (lifespan event in FastAPI), not lazily
on first request. Startup is slower but all subsequent requests are
unaffected.

## pgvector IVFFlat index requires pre-population
IVFFlat indexes cannot be created on empty tables -- they require at
least lists x 2 rows to train the cluster centroids. Solution:
index creation is deferred to a post-population migration script
rather than running at schema init time.

## Streaming and JWT middleware composition
SSE streaming (POST /chat/stream) requires the response to begin
immediately, but JWT verification happens in middleware before the
route handler. If verification is slow, the SSE connection appears
to hang. Solution: JWT verification is kept synchronous and lightweight
(no DB lookup -- all claims are in the token itself), keeping
middleware latency under 2ms.

## Emotional coherence across sessions
Without memory, the assistant treats every conversation as the first --
users must re-establish context every time, breaking the companion
experience. With naive memory retrieval (top-5 by similarity only),
old irrelevant memories crowd out recent ones. Solution: retrieval
uses a recency-weighted similarity score -- recent memories get a
boosted score multiplier -- ensuring the most contextually current
memories surface first.
