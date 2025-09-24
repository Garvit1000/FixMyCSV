import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Target, Zap, Users, Code, Smartphone, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Database } from 'lucide-react';
import { Link } from 'react-router-dom';

const RoadmapPage = () => {
  const roadmapItems = [
    {
      quarter: "Q1 2025",
      status: "completed",
      items: [
        {
          title: "Data Transformation Toolkit",
          description: "Advanced tools for data cleaning and manipulation",
          icon: <Code className="w-4 h-4" />,
          tags: ["Core Feature", "Released"]
        },
        {
          title: "Export Options",
          description: "Flexible data export formats and integrations",
          icon: <Users className="w-4 h-4" />,
          tags: ["Support", "Released"]
        }
      ]
    },
    {
      quarter: "Q2 2025",
      status: "in-progress", 
      items: [
        {
          title: "Advanced Analytics Dashboard",
          description: "Real-time insights and reporting capabilities",
          icon: <Target className="w-4 h-4" />,
          tags: ["Analytics", "In Progress"]
        }
      ]
    },
    {
      quarter: "Q3 2025",
      status: "planned",
      items: [
        {
          title: "API Integration Hub",
          description: "Connect with third-party services and APIs",
          icon: <Globe className="w-4 h-4" />,
          tags: ["Integration", "Planned"]
        },
        {
          title: "Collaboration Features",
          description: "Team workspaces and real-time collaboration",
          icon: <Users className="w-4 h-4" />,
          tags: ["Collaboration", "Planned"]
        }
      ]
    },
    {
      quarter: "Q4 2025",
      status: "planned",
      items: [
        {
          title: "AI-Powered Insights",
          description: "Machine learning recommendations and automation",
          icon: <Zap className="w-4 h-4" />,
          tags: ["AI/ML", "Planned"]
        },
        {
          title: "Enterprise Features",
          description: "Advanced security, compliance, and admin controls",
          icon: <Target className="w-4 h-4" />,
          tags: ["Enterprise", "Planned"]
        }
      ]
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'planned':
        return <Target className="w-5 h-5 text-gray-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-300';
      case 'in-progress':
        return 'bg-blue-100 border-blue-300';
      case 'planned':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTagVariant = (tag) => {
    if (tag.includes('Released')) return 'default';
    if (tag.includes('In Progress')) return 'secondary';
    if (tag.includes('Planned')) return 'outline';
    return 'secondary';
  };

  return (
    <div>
    <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6">
                    <div className="flex items-center justify-between h-14 sm:h-16">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            <Database className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                            <a href="/" className="text-lg font-semibold text-black">FixMyCSV</a>
                        </div>
                        <nav className="hidden sm:flex items-center space-x-4 lg:space-x-6">
                            <a href="/docs" className="text-sm text-gray-600 hover:text-black transition-colors">Docs</a>
                            <Link to="/roadmap">
                                <Button size="sm" className="bg-black hover:bg-gray-800 text-white text-sm h-8 px-3 sm:px-4 rounded-md">
                                    Roadmap
                                </Button>
                            </Link>
                        </nav>
                        {/* Mobile menu button */}
                        <div className="sm:hidden space-x-4">
                            <a href="/docs" className="text-sm text-gray-600 hover:text-black transition-colors ">Docs</a>

                            <Link to="/roadmap">
                                <Button size="sm" className="bg-black hover:bg-gray-800 text-white text-xs h-7 px-3 rounded-md">
                                    Roadmap
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>
    <div className="min-h-screen bg-gray-50 p-6">
        
      <div className="max-w-4xl mx-auto">
         
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Roadmap</h1>
          <p className="text-gray-600">Our planned features and development timeline</p>
        </div>

        {/* Roadmap Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

          {roadmapItems.map((quarterData, index) => (
            <div key={quarterData.quarter} className="relative mb-12">
              {/* Quarter Header */}
              <div className="flex items-center mb-6">
                <div className={`flex items-center justify-center w-16 h-16 rounded-full border-4 ${getStatusColor(quarterData.status)} relative z-10`}>
                  {getStatusIcon(quarterData.status)}
                </div>
                <div className="ml-6">
                  <h2 className="text-xl font-semibold text-gray-900">{quarterData.quarter}</h2>
                  <p className="text-sm text-gray-500 capitalize">{quarterData.status.replace('-', ' ')}</p>
                </div>
              </div>

              {/* Quarter Items */}
              <div className="ml-24 space-y-4">
                {quarterData.items.map((item, itemIndex) => (
                  <Card key={itemIndex} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          {item.icon}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {item.tags.map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant={getTagVariant(tag)} className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <Card className="p-6 mt-8 bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Target className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Have suggestions?</h3>
              <p className="text-sm text-gray-600 mb-3">
                We'd love to hear your feedback and feature requests. Our roadmap is flexible and community-driven.
              </p>
              <div className="flex space-x-2">
                <Badge variant="outline" className="text-xs">Community Driven</Badge>
                <Badge variant="outline" className="text-xs">Flexible Timeline</Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
    </div>
  );
};


export default RoadmapPage;