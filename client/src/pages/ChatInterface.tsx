import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Send, Upload, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
};

type ConversationStage =
  | "initial_story"
  | "questions"
  | "upload_evidence"
  | "analysis"
  | "contact_form"
  | "completed";

export default function ChatInterface() {
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [stage, setStage] = useState<ConversationStage>("initial_story");
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Contact form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bestTime, setBestTime] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const startConversationMutation = trpc.chat.startConversation.useMutation();
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();
  const uploadEvidenceMutation = trpc.chat.uploadEvidence.useMutation();
  const generateAnalysisMutation = trpc.chat.generateAnalysis.useMutation();
  const submitLeadMutation = trpc.chat.submitLead.useMutation();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Start conversation on mount
  useEffect(() => {
    const initConversation = async () => {
      const result = await startConversationMutation.mutateAsync();
      setConversationId(result.conversationId);
    };
    initConversation();
  }, []);

  const addMessage = (role: "user" | "assistant" | "system", content: string) => {
    setMessages(prev => [...prev, { role, content, timestamp: new Date() }]);
  };

  const handleSendInitialStory = async () => {
    if (!currentMessage.trim() || !conversationId) return;

    setIsLoading(true);
    const userMessage = currentMessage;
    setCurrentMessage("");

    // Add user message to UI
    addMessage("user", userMessage);

    // Add "AI is thinking" message
    addMessage("assistant", "💭 Analyzing your situation...");

    try {
      const result = await sendMessageMutation.mutateAsync({
        conversationId,
        message: userMessage,
        isInitialStory: true,
      });

      // Remove "thinking" message and add real response
      setMessages(prev => prev.slice(0, -1));
      addMessage("assistant", result.response);

      // Store questions and move to questions stage
      if (result.questions) {
        setQuestions(result.questions);
        setStage("questions");
      }
    } catch (error) {
      toast.error("Failed to send message");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerQuestion = async () => {
    if (!currentMessage.trim() || !conversationId) return;

    setIsLoading(true);
    const answer = currentMessage;
    setCurrentMessage("");

    // Add user answer to UI
    addMessage("user", answer);

    // Add "AI is thinking" message
    addMessage("assistant", "💭 Got it, processing...");

    // Store answer
    setAnswers(prev => [...prev, answer]);

    try {
      const result = await sendMessageMutation.mutateAsync({
        conversationId,
        message: answer,
        isInitialStory: false,
      });

      // Remove "thinking" message and add real response
      setMessages(prev => prev.slice(0, -1));
      addMessage("assistant", result.response);

      // Move to next question or evidence upload
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // All questions answered, move to evidence upload
        setStage("upload_evidence");
        addMessage(
          "assistant",
          "Thank you for answering those questions. To help you better, I need to see the evidence you have. Please upload up to 5 documents, photos, or screenshots related to your situation."
        );
      }
    } catch (error) {
      toast.error("Failed to send answer");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + uploadedFiles.length > 5) {
      toast.error("Maximum 5 files allowed");
      return;
    }

    setUploadedFiles(prev => [...prev, ...files]);
    toast.success(`${files.length} file(s) added`);
  };

  const handleSubmitEvidence = async () => {
    if (!conversationId || uploadedFiles.length === 0) {
      toast.error("Please upload at least one file");
      return;
    }

    setIsLoading(true);

    try {
      // Upload each file
      for (const file of uploadedFiles) {
        const reader = new FileReader();
        const fileData = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const base64 = (reader.result as string).split(",")[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        await uploadEvidenceMutation.mutateAsync({
          conversationId,
          fileData,
          filename: file.name,
          mimeType: file.type,
        });
      }

      addMessage("assistant", "✅ Evidence uploaded successfully! Analyzing your situation...");

      // Generate analysis
      setStage("analysis");
      const analysis = await generateAnalysisMutation.mutateAsync({ conversationId });
      setAnalysisResult(analysis);

      // Show analysis results
      setStage("contact_form");
    } catch (error) {
      toast.error("Failed to upload evidence");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitLead = async () => {
    if (!conversationId || !name || !email) {
      toast.error("Please provide your name and email");
      return;
    }

    setIsLoading(true);

    try {
      await submitLeadMutation.mutateAsync({
        conversationId,
        name,
        email,
        phone,
        bestTimeToCall: bestTime,
      });

      setStage("completed");
      addMessage(
        "assistant",
        "🎉 Thank you! We've received your information and will contact you within 24 hours with your custom document package and pricing options. Check your email for confirmation!"
      );
    } catch (error) {
      toast.error("Failed to submit information");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container max-w-4xl py-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2">Turbo Response HQ</h1>
          <p className="text-muted-foreground">
            AI-Powered Consumer Advocacy - Tell us your story
          </p>
        </div>

        {/* Chat Container */}
        <Card className="p-6 mb-6 min-h-[500px] max-h-[600px] overflow-y-auto">
          <div className="space-y-4">
            {/* Welcome Message */}
            {messages.length === 0 && stage === "initial_story" && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm">
                  👋 <strong>Hi! I'm your Consumer Advocacy Assistant.</strong>
                </p>
                <p className="text-sm mt-2">
                  I'm here to understand your situation and help you figure out your next steps.
                </p>
                <p className="text-sm mt-2 font-medium">
                  What's going on? Tell me in your own words.
                </p>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : msg.role === "system"
                      ? "bg-green-50 dark:bg-green-900/20 text-sm"
                      : "bg-slate-200 dark:bg-slate-700"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Current Question */}
            {stage === "questions" && questions[currentQuestionIndex] && (
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg border-l-4 border-blue-600">
                <p className="font-medium">Question {currentQuestionIndex + 1} of {questions.length}:</p>
                <p className="mt-2">{questions[currentQuestionIndex]}</p>
              </div>
            )}

            {/* Analysis Results */}
            {stage === "contact_form" && analysisResult && (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg border">
                <h3 className="text-xl font-bold mb-4">📋 Your Situation Analysis</h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Summary:</h4>
                    <p className="text-sm">{analysisResult.summary}</p>
                  </div>

                  {analysisResult.potentialIssues.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">🔍 Potential Issues:</h4>
                      <ul className="text-sm space-y-1">
                        {analysisResult.potentialIssues.map((issue: string, idx: number) => (
                          <li key={idx}>• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysisResult.inconsistencies.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">⚠️ Inconsistencies Detected:</h4>
                      <ul className="text-sm space-y-1">
                        {analysisResult.inconsistencies.map((inc: string, idx: number) => (
                          <li key={idx}>• {inc}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold mb-2">💡 What You Can Do:</h4>
                    <ul className="text-sm space-y-1">
                      {analysisResult.nextSteps.map((step: string, idx: number) => (
                        <li key={idx}>✅ {step}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 p-4 bg-white dark:bg-slate-900 rounded-lg border">
                    <h4 className="font-semibold mb-2">🎯 How We Can Help:</h4>
                    <p className="text-sm mb-3">
                      We specialize in preparing professional response documents customized to YOUR
                      specific situation. We'll create a complete document package ready to sign and
                      send.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ⚠️ <strong>Disclaimer:</strong> We are NOT lawyers and this is NOT legal
                      advice. We provide document preparation services only. For legal advice,
                      consult a licensed attorney.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-200 dark:bg-slate-700 p-3 rounded-lg">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </Card>

        {/* Input Area */}
        {stage === "initial_story" && (
          <div className="space-y-3">
            <Textarea
              value={currentMessage}
              onChange={e => setCurrentMessage(e.target.value)}
              placeholder="Type your story here... (e.g., 'This debt collector keeps calling me about a debt I don't recognize...')"
              className="min-h-[120px]"
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendInitialStory();
                }
              }}
            />
            <Button
              onClick={handleSendInitialStory}
              disabled={!currentMessage.trim() || isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send My Story
                </>
              )}
            </Button>
          </div>
        )}

        {stage === "questions" && (
          <div className="space-y-3">
            <Textarea
              value={currentMessage}
              onChange={e => setCurrentMessage(e.target.value)}
              placeholder="Type your answer here..."
              className="min-h-[100px]"
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAnswerQuestion();
                }
              }}
            />
            <Button
              onClick={handleAnswerQuestion}
              disabled={!currentMessage.trim() || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Answer
                </>
              )}
            </Button>
          </div>
        )}

        {stage === "upload_evidence" && (
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="mb-4 text-sm text-muted-foreground">
                Upload up to 5 files (images, PDFs, screenshots)
              </p>
              <Input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="max-w-xs mx-auto"
              />
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium">Uploaded Files ({uploadedFiles.length}/5):</p>
                {uploadedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    {file.name}
                  </div>
                ))}
              </div>
            )}

            <Button
              onClick={handleSubmitEvidence}
              disabled={uploadedFiles.length === 0 || isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>Continue</>
              )}
            </Button>
          </div>
        )}

        {stage === "contact_form" && (
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">💪 Ready to Take Action?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              We'll review everything and contact you within 24 hours with your custom plan and
              pricing options.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Full Name *</label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Email *</label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Phone</label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Best Time to Call</label>
                <select
                  value={bestTime}
                  onChange={e => setBestTime(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select a time</option>
                  <option value="morning">Morning (9am-12pm)</option>
                  <option value="afternoon">Afternoon (12pm-5pm)</option>
                  <option value="evening">Evening (5pm-8pm)</option>
                </select>
              </div>

              <Button
                onClick={handleSubmitLead}
                disabled={!name || !email || isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>Yes, I Want Help →</>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                🔒 Your information is secure and will only be used to help with your situation.
              </p>
            </div>
          </Card>
        )}

        {stage === "completed" && (
          <Card className="p-6 text-center bg-green-50 dark:bg-green-900/20">
            <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-600" />
            <h3 className="text-2xl font-bold mb-2">Submission Received!</h3>
            <p className="text-sm text-muted-foreground">
              Check your email for confirmation. We'll be in touch soon!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

