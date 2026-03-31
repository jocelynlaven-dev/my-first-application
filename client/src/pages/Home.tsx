import { useState } from "react";
import { useCreateDecision } from "@/hooks/use-decisions";
import { PersonaCard } from "@/components/PersonaCard";
import { LoadingBoard } from "@/components/LoadingBoard";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, History, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { type PersonaResponse } from "@shared/schema";

const TOTAL_PERSONAS = 25;
const PERSONAS_PER_BOARD = 6;

export default function Home() {
  const [query, setQuery] = useState("");
  const [currentQuery, setCurrentQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<PersonaResponse[] | null>(null);
  const { toast } = useToast();

  const createDecision = useCreateDecision();

  const invokeBoard = async (decisionQuery: string) => {
    const textareaElement = document.getElementById("query") as HTMLTextAreaElement;
    if (textareaElement) textareaElement.blur();

    try {
      const data = await createDecision.mutateAsync({ query: decisionQuery });
      const responses = data.responses as unknown as PersonaResponse[];
      setResults(responses);
      setCurrentQuery(decisionQuery);
      setShowResults(true);
    } catch (error) {
      toast({
        title: "Error consulting the board",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleConsult = async () => {
    if (!query.trim()) {
      toast({
        title: "Please enter a decision",
        description: "The board needs something to deliberate on.",
        variant: "destructive",
      });
      return;
    }
    await invokeBoard(query);
  };

  // Cycle perspectives: keep same question, get new random personas
  const handleCycle = async () => {
    await invokeBoard(currentQuery);
  };

  const resetBoard = () => {
    setShowResults(false);
    setTimeout(() => {
      setResults(null);
      setQuery("");
      setCurrentQuery("");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-sans selection:bg-primary/10">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-pattern-grid" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-accent/30 rounded-full blur-[140px] -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] translate-y-1/2" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-16 md:py-28">

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary/70 text-xs font-medium tracking-[0.1em] uppercase mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            Decision Sanctuary
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-medium text-foreground mb-8 leading-[1.1]">
            Counsel of the <span className="italic serif text-primary/80">Wise</span>
          </h1>
          <p className="text-xl text-muted-foreground/80 leading-relaxed max-w-2xl mx-auto font-light italic">
            "In the multitude of counselors there is safety."
          </p>
        </motion.div>

        {/* Input Section */}
        <AnimatePresence mode="wait">
          {!showResults && !createDecision.isPending && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl mx-auto bg-card/40 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-primary/5 p-10 border border-white/20"
            >
              <div className="space-y-8">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-display text-foreground/90">What path do you contemplate?</h2>
                  <p className="text-sm text-muted-foreground">The board awaits your question with focused presence.</p>
                </div>

                <Textarea
                  id="query"
                  placeholder="Describe the crossroad you face..."
                  className="min-h-[160px] text-xl p-6 resize-none border-2 border-primary/30 focus-visible:ring-primary/50 bg-white rounded-2xl transition-all placeholder:text-muted-foreground/30 italic font-light"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleConsult();
                    }
                  }}
                  data-testid="input-decision"
                />

                <div className="flex flex-col items-center gap-6 pt-4">
                  <Button
                    size="lg"
                    onClick={handleConsult}
                    disabled={!query.trim()}
                    data-testid="button-invoke"
                    className="w-full md:w-auto min-w-[240px] bg-primary hover:bg-primary/95 text-primary-foreground rounded-full py-7 text-lg shadow-xl shadow-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98] font-display"
                  >
                    Invoke the Board
                  </Button>

                  <div className="text-[10px] text-muted-foreground/50 flex items-center gap-2 tracking-widest uppercase">
                    <History className="w-3 h-3" />
                    <span>Silent & Secure Deliberation</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        <AnimatePresence>
          {createDecision.isPending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingBoard />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Grid */}
        <AnimatePresence>
          {showResults && results && !createDecision.isPending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className=""
            >
              {/* Results Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-10 px-2">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-display font-medium text-foreground/90">The Deliberation</h2>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary/8 border border-primary/15 text-primary/60 text-[10px] font-medium tracking-widest uppercase">
                      {PERSONAS_PER_BOARD} of {TOTAL_PERSONAS}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm italic font-light">Wisdom gathered for: "{currentQuery}"</p>
                </div>

                <div className="flex items-center gap-3 pointer-events-auto flex-shrink-0">
                  <Button
                    variant="outline"
                    onClick={handleCycle}
                    disabled={createDecision.isPending}
                    data-testid="button-cycle"
                    className="gap-2 text-primary/70 border-primary/20 hover:bg-primary/5 hover:text-primary rounded-full px-5 transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Show Different Perspectives
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={resetBoard}
                    data-testid="button-new"
                    className="gap-2 text-primary/60 hover:text-primary hover:bg-primary/5 rounded-full px-5 transition-all"
                  >
                    New Question <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Persona Cards Grid */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={results.map(r => r.persona).join("-")}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {results.map((response, index) => (
                    <PersonaCard
                      key={response.persona}
                      response={response}
                      delay={index * 0.08}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
