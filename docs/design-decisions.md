# Design Decisions

## Why safety detection runs first -- before everything else
A crisis response cannot wait for embedding, retrieval, or LLM inference.
If a user is in crisis, any latency in the pipeline is a failure.
The safety detector is fully offline (pattern matching, no model load),
runs in <1ms, and short-circuits the entire pipeline on a crisis flag --
returning a hardcoded, human-reviewed safe response with crisis resources
immediately. No LLM is involved in crisis responses.

## Why pgvector over a dedicated vector database
SOS AI already requires PostgreSQL for relational data (users,
conversations, auth). Adding a separate vector DB (Pinecone, Weaviate)
introduces an additional service dependency, additional auth surface,
and data split across two stores. pgvector keeps everything in one
database -- relational structure + vector search -- with the same
RLS policies protecting both.

## Why Row-Level Security (RLS) over application-layer filtering
Application-layer filtering (WHERE user_id = ?) can be bypassed by
bugs, missing WHERE clauses, or injection. RLS enforces isolation at
the database level -- even a compromised query cannot return another
user's data. For an emotional support platform handling sensitive
conversations, this is non-negotiable.

## Why offline emotion detection
Sending message content to an external sentiment API introduces:
privacy risk (sensitive emotional content leaves the system),
latency (network round-trip per message), and availability dependency.
j-hartmann/emotion-english-distilroberta-base runs locally, infers
in ~40ms on CPU, and keeps all emotional data on-device.

## Why Gemini 1.5 Flash with Ollama fallback
Gemini 1.5 Flash offers a strong capability/latency tradeoff for
conversational tasks. The Ollama fallback (any local model) enables
fully offline operation -- important for users in low-connectivity
environments or those with strong privacy preferences. The fallback
is transparent to the user.

## Why journal-entry UI over chat bubbles
Chat bubbles carry associations with messaging apps -- casual, ephemeral,
social. SOS AI's use case is introspective and personal. Journal-entry
rendering (full-width, serif font, generous line height, no bubble
chrome) signals that this is a different kind of conversation -- one
worth taking seriously. The Alchemai-inspired aesthetic (botanical
motifs, handwriting font for annotations, warm off-white palette)
reinforces psychological safety through visual calm.

## Why user-controlled memory deletion
Users must trust that the system isn't accumulating data about them
without recourse. The DELETE /memory/{id} endpoint and the memory
panel in the UI give users full visibility and control over what
the system remembers. This is a product decision as much as a
technical one -- trust requires control.
