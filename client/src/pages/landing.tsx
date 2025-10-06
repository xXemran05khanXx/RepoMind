import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Brain, Github, Play, Check, Lightbulb, Shield, Users, Search, History, Bot, Layers, Zap, Sparkles, HelpCircle } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Brain className="text-primary h-8 w-8" />
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
                  RepoMind
                </span>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
              <a href="#docs" className="text-muted-foreground hover:text-foreground transition-colors">
                Docs
              </a>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/auth">
                <Button variant="ghost" data-testid="button-signin">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth">
                <Button data-testid="button-start-free">
                  Start Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
                AI-Powered
              </span>
              <br />
              Codebase Intelligence
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Connect your GitHub repositories and get instant AI-powered insights, 
              commit summaries, and contextual code assistance using advanced RAG technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" className="text-lg font-medium" data-testid="button-connect-github">
                  <Github className="mr-2 h-5 w-5" />
                  Connect GitHub - Free
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg font-medium" data-testid="button-watch-demo">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="mt-16">
            <img 
              src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080" 
              alt="Dashboard showing AI code analysis interface" 
              className="rounded-xl shadow-2xl w-full border border-border"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Powerful Features for Developers</h2>
            <p className="text-xl text-muted-foreground">Everything you need to understand and collaborate on complex codebases</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-card border border-border p-6 rounded-lg" data-testid="feature-github-integration">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Github className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">GitHub Integration</h3>
              <p className="text-muted-foreground">Seamlessly connect repositories and analyze entire codebases with advanced vector embeddings.</p>
            </div>
            
            <div className="bg-card border border-border p-6 rounded-lg" data-testid="feature-ai-assistant">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Bot className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Code Assistant</h3>
              <p className="text-muted-foreground">Ask natural language questions about your code and get contextual, accurate answers using RAG.</p>
            </div>
            
            <div className="bg-card border border-border p-6 rounded-lg" data-testid="feature-commit-insights">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <History className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Commit Insights</h3>
              <p className="text-muted-foreground">AI-generated summaries of commit histories help you understand project evolution quickly.</p>
            </div>
            
            <div className="bg-card border border-border p-6 rounded-lg" data-testid="feature-semantic-search">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Search className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Semantic Search</h3>
              <p className="text-muted-foreground">Find relevant code sections using natural language search powered by vector embeddings.</p>
            </div>
            
            <div className="bg-card border border-border p-6 rounded-lg" data-testid="feature-team-collaboration">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
              <p className="text-muted-foreground">Share insights and collaborate with team members on repository analysis and findings.</p>
            </div>
            
            <div className="bg-card border border-border p-6 rounded-lg" data-testid="feature-secure-private">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-muted-foreground">Enterprise-grade security with OAuth authentication and encrypted data processing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground">Start free and scale as you grow</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="bg-card border border-border p-8 rounded-lg" data-testid="plan-free">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">Free Tier</h3>
                <div className="text-4xl font-bold mb-4">$0<span className="text-lg text-muted-foreground">/month</span></div>
                <p className="text-muted-foreground mb-6">Perfect for getting started</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <Check className="text-green-500 mr-3 h-4 w-4" />
                  3 repositories
                </li>
                <li className="flex items-center">
                  <Check className="text-green-500 mr-3 h-4 w-4" />
                  100 AI queries/month
                </li>
                <li className="flex items-center">
                  <Check className="text-green-500 mr-3 h-4 w-4" />
                  Basic commit summaries
                </li>
                <li className="flex items-center">
                  <Check className="text-green-500 mr-3 h-4 w-4" />
                  GitHub OAuth integration
                </li>
                <li className="flex items-center">
                  <Check className="text-green-500 mr-3 h-4 w-4" />
                  Community support
                </li>
              </ul>
              
              <Link href="/auth">
                <Button variant="outline" className="w-full" data-testid="button-start-free-plan">
                  Start Free
                </Button>
              </Link>
            </div>
            
            {/* Pro Tier */}
            <div className="bg-primary/5 border border-primary p-8 rounded-lg relative" data-testid="plan-pro">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <div className="text-4xl font-bold mb-4">$19<span className="text-lg text-muted-foreground">/month</span></div>
                <p className="text-muted-foreground mb-6">For professional developers</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <Check className="text-green-500 mr-3 h-4 w-4" />
                  Unlimited repositories
                </li>
                <li className="flex items-center">
                  <Check className="text-green-500 mr-3 h-4 w-4" />
                  Unlimited AI queries
                </li>
                <li className="flex items-center">
                  <Check className="text-green-500 mr-3 h-4 w-4" />
                  Advanced analytics
                </li>
                <li className="flex items-center">
                  <Check className="text-green-500 mr-3 h-4 w-4" />
                  Team collaboration
                </li>
                <li className="flex items-center">
                  <Check className="text-green-500 mr-3 h-4 w-4" />
                  Priority support
                </li>
                <li className="flex items-center">
                  <Check className="text-green-500 mr-3 h-4 w-4" />
                  API access
                </li>
              </ul>
              
              <Button className="w-full" data-testid="button-upgrade-pro">
                Upgrade to Pro
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-card/30 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">RepoMind ingests your repository, creates semantic embeddings of code, and serves low-latency contextual answers powered by modern LLMs.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-card border border-border p-6 rounded-lg">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Layers className="text-primary h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Ingest & Index</h3>
              <p className="text-sm text-muted-foreground">We fetch repository files and create vector embeddings for each chunk, storing structure and metadata for rapid retrieval.</p>
            </div>
            <div className="bg-card border border-border p-6 rounded-lg">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="text-primary h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Retrieve Context</h3>
              <p className="text-sm text-muted-foreground">Queries run semantic search over embeddings, selecting the most relevant code snippets & commit insights.</p>
            </div>
            <div className="bg-card border border-border p-6 rounded-lg">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="text-primary h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Augment & Answer</h3>
              <p className="text-sm text-muted-foreground">The LLM synthesizes an answer with citation metadata so you can trace every claim back to a file.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Answers to common product and security questions.</p>
          </div>
          <div className="space-y-6">
            {[
              { q: 'Do you store my source code?', a: 'We cache file contents for embedding and context retrieval. You can delete a repository at any time which removes all derived data.' },
              { q: 'Which AI models are used?', a: 'Currently OpenAI gpt-5 with an abstraction layer allowing future Gemini or self-hosted models.' },
              { q: 'How are embeddings used?', a: 'Embeddings enable semantic similarity search so we only send the most relevant code to the model.' },
              { q: 'Will you support self-hosting?', a: 'Planned. Architecture keeps provider & vector layers pluggable.' },
            ].map(item => (
              <div key={item.q} className="border border-border rounded-lg p-5 bg-card/40">
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">{item.q}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-card/40 border-t border-border">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">Ready to accelerate code understanding?</h2>
          <p className="text-lg text-muted-foreground mb-8">Connect a repository and get your first AI insights in under two minutes.</p>
          <Link href="/auth">
            <Button size="lg" className="text-lg font-medium">
              <Github className="mr-2 h-5 w-5" /> Connect GitHub
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Brain className="text-primary h-6 w-6" />
              <span className="text-lg font-bold">RepoMind</span>
            </div>
            <div className="text-muted-foreground text-sm">
              © 2024 RepoMind. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
