from flask import Flask, request, jsonify, send_file, render_template
from flask_cors import CORS
import random
import os
import json
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
import pdfkit

app = Flask(__name__)

# Configure CORS based on environment
if os.environ.get('FLASK_ENV') == 'production':
    # In production, only allow requests from your domain
    CORS(app, resources={r"/*": {
        "origins": ["https://your-domain.com"],  # Replace with your actual domain
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }})
else:
    # In development, allow all origins
    CORS(app, resources={r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }})

# Ensure resumes directory exists
os.makedirs('resumes', exist_ok=True)

# Enhanced response templates with more detailed options
responses = {
    'greetings': [
        "Hello! I'm your AI career assistant. I can help you with:\n1. Resume creation and optimization\n2. Interview preparation\n3. Job search assistance\n4. Career development\nWhat would you like help with?",
        "Hi there! I'm here to help you with your career journey. Would you like assistance with:\n1. Building your resume\n2. Preparing for interviews\n3. Finding the right job\n4. Career growth strategies?",
        "Welcome! I can assist you with various career needs. Choose from:\n1. Resume and cover letter help\n2. Interview practice and tips\n3. Job search guidance\n4. Career planning advice"
    ],
    'resume': {
        'initial': [
            "I can help you with your resume. Would you like to:\n1. Create a new resume\n2. Analyze your current resume\n3. Get improvement tips\n4. Learn about ATS optimization",
            "Let's work on your resume. Choose an option:\n1. Start from scratch\n2. Review existing resume\n3. Get formatting tips\n4. Learn about keywords"
        ],
        'create': [
            "Let's create your resume. Please provide:\n1. Your current job title\n2. Years of experience\n3. Key skills\n4. Target industry",
            "I'll help you build a strong resume. Tell me about:\n1. Your professional background\n2. Education details\n3. Technical skills\n4. Career objectives"
        ],
        'analyze': [
            "I'll analyze your resume. Please share:\n1. Your current resume text\n2. Target job role\n3. Industry\n4. Years of experience",
            "Let's review your resume. I'll check for:\n1. Format and structure\n2. Keywords and ATS optimization\n3. Achievement statements\n4. Professional presentation"
        ],
        'tips': [
            "Here are some resume improvement tips:\n1. Use action verbs\n2. Quantify achievements\n3. Include relevant keywords\n4. Keep it concise\n5. Focus on results",
            "To make your resume stand out:\n1. Customize for each job\n2. Highlight relevant skills\n3. Show impact with numbers\n4. Use professional formatting\n5. Proofread carefully"
        ],
        'follow_up': {
            'create': {
                'experience': [
                    "Great! Let's detail your experience. For each role, include:\n1. Job title and company\n2. Duration of employment\n3. Key responsibilities\n4. Major achievements\n5. Technologies used",
                    "Now, let's focus on your work experience. For each position:\n1. Company name and location\n2. Your role and team size\n3. Key projects completed\n4. Skills developed\n5. Impact on the company"
                ],
                'education': [
                    "Let's add your education details:\n1. Degree and major\n2. University name\n3. Graduation year\n4. Relevant coursework\n5. Academic achievements",
                    "Education section time! Include:\n1. Degree level and field\n2. Institution name\n3. Years attended\n4. GPA (if strong)\n5. Relevant academic projects"
                ],
                'skills': [
                    "Now, let's list your skills:\n1. Technical skills (programming, tools)\n2. Soft skills (communication, leadership)\n3. Industry-specific skills\n4. Certifications\n5. Languages (if relevant)",
                    "Skills section! Categorize your skills:\n1. Core technical competencies\n2. Development frameworks\n3. Project management tools\n4. Industry knowledge\n5. Professional certifications"
                ]
            },
            'analyze': {
                'format': [
                    "Let's check your resume format:\n1. Is it ATS-friendly?\n2. Are sections clearly defined?\n3. Is the font professional?\n4. Is there enough white space?\n5. Is the length appropriate?",
                    "Format review:\n1. Consistent formatting throughout?\n2. Professional font and size?\n3. Clear section headers?\n4. Proper margins and spacing?\n5. PDF format for submission?"
                ],
                'content': [
                    "Content analysis:\n1. Are achievements quantified?\n2. Are action verbs used?\n3. Is there relevant keywords?\n4. Is the experience relevant?\n5. Is there unnecessary information?",
                    "Let's review your content:\n1. Are results highlighted?\n2. Are skills demonstrated?\n3. Is the language professional?\n4. Is the information current?\n5. Is it tailored to the role?"
                ],
                'keywords': [
                    "Keyword optimization:\n1. Industry-specific terms\n2. Job title variations\n3. Technical skills\n4. Soft skills\n5. Tools and technologies",
                    "Let's optimize keywords:\n1. Role-specific terms\n2. Technical competencies\n3. Industry buzzwords\n4. Required qualifications\n5. Transferable skills"
                ]
            }
        }
    },
    'interview': {
        'initial': [
            "I can help you prepare for interviews. Would you like to:\n1. Practice common questions\n2. Get industry-specific tips\n3. Learn about behavioral interviews\n4. Get real-time feedback",
            "Let's get you interview-ready. Choose:\n1. Question practice\n2. Industry insights\n3. Behavioral interview prep\n4. Mock interview with feedback"
        ],
        'practice': {
            'technical': [
                "Let's practice technical questions. I'll ask about:\n1. Problem-solving approaches\n2. Technical concepts\n3. Project experience\n4. Coding challenges",
                "Technical interview practice starting. Topics:\n1. System design\n2. Algorithms\n3. Data structures\n4. Debugging scenarios"
            ],
            'behavioral': [
                "Behavioral interview practice. I'll ask about:\n1. Teamwork experiences\n2. Problem-solving stories\n3. Leadership examples\n4. Conflict resolution",
                "Let's practice behavioral questions. Topics:\n1. Work ethic\n2. Communication\n3. Adaptability\n4. Decision making"
            ],
            'situational': [
                "Situational interview practice. Scenarios:\n1. Work challenges\n2. Team conflicts\n3. Project management\n4. Time pressure situations",
                "Practice handling real-world scenarios:\n1. Crisis management\n2. Team leadership\n3. Project prioritization\n4. Stakeholder communication"
            ]
        },
        'tips': {
            'general': [
                "General interview tips:\n1. Research the company\n2. Practice your answers\n3. Dress appropriately\n4. Arrive early\n5. Follow up after",
                "Interview success tips:\n1. Prepare questions to ask\n2. Bring extra copies of resume\n3. Maintain good posture\n4. Make eye contact\n5. Show enthusiasm"
            ],
            'technical': [
                "Technical interview tips:\n1. Review core concepts\n2. Practice coding problems\n3. Explain your thought process\n4. Ask clarifying questions\n5. Test your solutions",
                "Acing technical interviews:\n1. Brush up on fundamentals\n2. Practice whiteboarding\n3. Think aloud while solving\n4. Consider edge cases\n5. Optimize your solutions"
            ],
            'behavioral': [
                "Behavioral interview tips:\n1. Use STAR method\n2. Prepare specific examples\n3. Be honest and authentic\n4. Show growth mindset\n5. Focus on results",
                "Mastering behavioral interviews:\n1. Structure your answers\n2. Quantify achievements\n3. Show self-awareness\n4. Demonstrate learning\n5. Highlight soft skills"
            ]
        },
        'follow_up': {
            'technical': {
                'coding': [
                    "Let's practice coding questions:\n1. Data structures and algorithms\n2. System design principles\n3. Problem-solving approaches\n4. Code optimization\n5. Testing and debugging",
                    "Coding practice time:\n1. Time and space complexity\n2. Design patterns\n3. Best practices\n4. Edge cases\n5. Code readability"
                ],
                'system_design': [
                    "System design practice:\n1. Scalability considerations\n2. Database design\n3. API design\n4. Caching strategies\n5. Security aspects",
                    "Let's design a system:\n1. Requirements gathering\n2. Architecture design\n3. Data flow\n4. Component interaction\n5. Performance optimization"
                ]
            },
            'behavioral': {
                'teamwork': [
                    "Teamwork scenarios:\n1. Conflict resolution\n2. Collaboration examples\n3. Leadership situations\n4. Communication challenges\n5. Project coordination",
                    "Team experience:\n1. Cross-functional teams\n2. Remote collaboration\n3. Team building\n4. Mentoring others\n5. Handling disagreements"
                ],
                'problem_solving': [
                    "Problem-solving examples:\n1. Technical challenges\n2. Process improvements\n3. Resource constraints\n4. Time management\n5. Innovation examples",
                    "Let's discuss problem-solving:\n1. Complex issues faced\n2. Decision-making process\n3. Alternative solutions\n4. Results achieved\n5. Lessons learned"
                ]
            },
            'feedback': [
                "Based on your practice:\n1. Strengths identified\n2. Areas for improvement\n3. Technical knowledge\n4. Communication skills\n5. Next steps",
                "Practice feedback:\n1. Technical accuracy\n2. Problem-solving approach\n3. Communication clarity\n4. Time management\n5. Overall performance"
            ]
        }
    },
    'job_search': {
        'initial': [
            "I can help with your job search. Would you like:\n1. Job matching based on skills\n2. Application tips\n3. Salary negotiation advice\n4. Industry insights",
            "Let's find your next opportunity. Choose:\n1. Job recommendations\n2. Application strategies\n3. Interview preparation\n4. Career planning"
        ],
        'matching': [
            "Let's find jobs that match your profile. Please provide:\n1. Your skills\n2. Experience level\n3. Preferred location\n4. Industry preference",
            "I'll help match you with suitable jobs. Share:\n1. Technical skills\n2. Years of experience\n3. Target companies\n4. Salary expectations"
        ],
        'application': [
            "Job application tips:\n1. Customize your resume\n2. Write targeted cover letters\n3. Network effectively\n4. Follow up appropriately\n5. Track your applications",
            "Application success strategies:\n1. Research companies\n2. Highlight relevant skills\n3. Show cultural fit\n4. Demonstrate value\n5. Maintain professional online presence"
        ],
        'negotiation': [
            "Salary negotiation tips:\n1. Research market rates\n2. Know your worth\n3. Consider total package\n4. Practice your pitch\n5. Be prepared to walk away",
            "Negotiation strategies:\n1. Start with research\n2. Focus on value\n3. Consider benefits\n4. Be confident\n5. Know your limits"
        ],
        'follow_up': {
            'matching': {
                'skills': [
                    "Skill matching analysis:\n1. Core competencies\n2. Technical expertise\n3. Soft skills\n4. Industry knowledge\n5. Transferable skills",
                    "Let's match your skills:\n1. Required qualifications\n2. Preferred skills\n3. Industry standards\n4. Emerging technologies\n5. Specialized knowledge"
                ],
                'experience': [
                    "Experience matching:\n1. Years of experience\n2. Industry background\n3. Project scope\n4. Team size\n5. Leadership roles",
                    "Experience analysis:\n1. Relevant experience\n2. Industry alignment\n3. Role progression\n4. Achievements\n5. Career growth"
                ]
            },
            'application': {
    'resume': [
                    "Resume customization:\n1. Job description keywords\n2. Relevant experience\n3. Skills alignment\n4. Achievement highlights\n5. Format optimization",
                    "Let's customize your resume:\n1. Role requirements\n2. Company culture\n3. Industry focus\n4. Key achievements\n5. Skills emphasis"
                ],
                'cover_letter': [
                    "Cover letter tips:\n1. Company research\n2. Role alignment\n3. Personal connection\n4. Value proposition\n5. Call to action",
                    "Writing your cover letter:\n1. Opening hook\n2. Experience summary\n3. Company fit\n4. Unique value\n5. Closing statement"
                ]
            },
            'negotiation': {
                'salary': [
                    "Salary negotiation:\n1. Market research\n2. Value proposition\n3. Benefits package\n4. Growth potential\n5. Negotiation strategy",
                    "Let's discuss salary:\n1. Industry standards\n2. Experience level\n3. Location factors\n4. Additional benefits\n5. Counter-offer approach"
                ],
                'benefits': [
                    "Benefits negotiation:\n1. Health insurance\n2. Retirement plans\n3. Vacation time\n4. Professional development\n5. Work flexibility",
                    "Benefits discussion:\n1. Insurance options\n2. 401k matching\n3. PTO policies\n4. Training budget\n5. Remote work options"
                ]
            }
        }
    },
    'user_options': {
        'resume': {
            '1': {
                'response': "Great choice! Let's create a new resume. First, tell me about your current job title and years of experience.",
                'next_steps': ['experience', 'education', 'skills']
            },
            '2': {
                'response': "Let's analyze your current resume. Please share your resume text or upload it.",
                'next_steps': ['format', 'content', 'keywords']
            },
            '3': {
                'response': "I'll help you improve your resume. What specific area would you like to focus on?",
                'next_steps': ['formatting', 'content', 'keywords', 'achievements']
            },
            '4': {
                'response': "Let's optimize your resume for ATS. What industry are you targeting?",
                'next_steps': ['industry_keywords', 'job_titles', 'skills', 'experience']
            }
        },
        'interview': {
            '1': {
                'response': "Let's practice interview questions. What type of role are you interviewing for?",
                'next_steps': ['technical', 'behavioral', 'situational']
            },
            '2': {
                'response': "I'll provide industry-specific tips. Which industry are you targeting?",
                'next_steps': ['tech', 'finance', 'healthcare', 'education']
            },
            '3': {
                'response': "Let's focus on behavioral interviews. What specific area would you like to practice?",
                'next_steps': ['teamwork', 'leadership', 'problem_solving', 'communication']
            },
            '4': {
                'response': "I'll provide real-time feedback during practice. Are you ready to start?",
                'next_steps': ['start_practice', 'setup_camera', 'review_guidelines']
            }
        },
        'job_search': {
            '1': {
                'response': "Let's find jobs that match your skills. What are your top 3 technical skills?",
                'next_steps': ['skills', 'experience', 'location', 'industry']
            },
            '2': {
                'response': "I'll help you with job applications. What stage are you at?",
                'next_steps': ['resume', 'cover_letter', 'application_form', 'follow_up']
            },
            '3': {
                'response': "Let's discuss salary negotiation. What's your target role and experience level?",
                'next_steps': ['market_research', 'value_proposition', 'benefits', 'strategy']
            },
            '4': {
                'response': "I'll provide industry insights. Which industry interests you?",
                'next_steps': ['trends', 'skills_demand', 'salary_ranges', 'growth_opportunities']
            }
        },
        'cover_letter': {
            '1': {
                'response': "Let's write a cover letter. What's the job title and company name?",
                'next_steps': ['job_details', 'company_research', 'experience_match', 'value_proposition']
            },
            '2': {
                'response': "I'll help you customize your cover letter. Please share the job description.",
                'next_steps': ['requirements', 'skills_match', 'achievements', 'company_fit']
            },
            '3': {
                'response': "Let's review your cover letter. Please share your current draft.",
                'next_steps': ['content', 'format', 'tone', 'impact']
            }
        }
    },
    'next_steps': {
        'resume': {
            'experience': "Now, let's detail your work experience. For each role, include:\n1. Job title and company\n2. Duration\n3. Key responsibilities\n4. Major achievements",
            'education': "Let's add your education details:\n1. Degree and major\n2. University\n3. Graduation year\n4. Relevant coursework",
            'skills': "List your skills in these categories:\n1. Technical skills\n2. Soft skills\n3. Industry-specific skills\n4. Certifications",
            'format': "Let's check your resume format:\n1. ATS compatibility\n2. Section organization\n3. Font and spacing\n4. Length",
            'content': "Content review:\n1. Achievement statements\n2. Action verbs\n3. Keywords\n4. Relevance",
            'keywords': "Keyword optimization:\n1. Industry terms\n2. Job titles\n3. Skills\n4. Tools"
        },
        'interview': {
            'technical': "Technical practice:\n1. Coding problems\n2. System design\n3. Problem-solving\n4. Technical concepts",
            'behavioral': "Behavioral practice:\n1. Teamwork examples\n2. Leadership stories\n3. Problem-solving\n4. Communication",
            'situational': "Situational practice:\n1. Work scenarios\n2. Team conflicts\n3. Project management\n4. Time pressure",
            'start_practice': "Practice session starting:\n1. Camera check\n2. Microphone check\n3. Environment setup\n4. Ready to begin"
        },
        'job_search': {
            'skills': "Skill matching:\n1. Core competencies\n2. Technical expertise\n3. Soft skills\n4. Industry knowledge",
            'experience': "Experience matching:\n1. Years of experience\n2. Industry background\n3. Project scope\n4. Leadership roles",
            'market_research': "Market research:\n1. Industry standards\n2. Location factors\n3. Experience level\n4. Company size",
            'trends': "Industry trends:\n1. Current demands\n2. Emerging skills\n3. Growth areas\n4. Future outlook"
        }
    },
    'default': [
        "I understand you're looking for help. Could you be more specific about what you need?",
        "I'm here to assist you. What specific career guidance are you looking for?",
        "I want to help you. Please let me know which area you'd like to focus on."
    ],
    'user_response_options': {
        'resume': {
            'initial': {
                'options': [
                    "1. Create a new resume",
                    "2. Analyze my current resume",
                    "3. Get improvement tips",
                    "4. Learn about ATS optimization"
                ],
                'prompt': "Please select an option (1-4) or type your choice:"
            },
            'create': {
                'experience': {
                    'options': [
                        "1. Add work experience",
                        "2. Add education",
                        "3. Add skills",
                        "4. Add certifications"
                    ],
                    'prompt': "What would you like to add? Select (1-4) or type your choice:"
                },
                'work_experience': {
                    'fields': [
                        "Job title",
                        "Company name",
                        "Duration (MM/YYYY - MM/YYYY)",
                        "Key responsibilities",
                        "Major achievements"
                    ],
                    'prompt': "Please provide the following information for your work experience:"
                }
            },
            'analyze': {
                'format': {
                    'options': [
                        "1. Check ATS compatibility",
                        "2. Review section organization",
                        "3. Check font and spacing",
                        "4. Verify length"
                    ],
                    'prompt': "What aspect would you like me to analyze? Select (1-4):"
                }
            }
        },
        'interview': {
            'initial': {
                'options': [
                    "1. Practice interview questions",
                    "2. Get industry-specific tips",
                    "3. Learn about behavioral interviews",
                    "4. Get real-time feedback"
                ],
                'prompt': "What would you like to focus on? Select (1-4):"
            },
            'practice': {
                'technical': {
                    'options': [
                        "1. Data structures and algorithms",
                        "2. System design",
                        "3. Problem-solving",
                        "4. Technical concepts"
                    ],
                    'prompt': "Which technical area would you like to practice? Select (1-4):"
                },
                'behavioral': {
                    'options': [
                        "1. Teamwork scenarios",
                        "2. Leadership examples",
                        "3. Problem-solving stories",
                        "4. Communication skills"
                    ],
                    'prompt': "Which behavioral aspect would you like to practice? Select (1-4):"
                }
            }
        },
        'job_search': {
            'initial': {
                'options': [
                    "1. Find jobs matching my skills",
                    "2. Get application tips",
                    "3. Learn about salary negotiation",
                    "4. Get industry insights"
                ],
                'prompt': "What would you like help with? Select (1-4):"
            },
            'matching': {
                'skills': {
                    'fields': [
                        "Technical skills",
                        "Years of experience",
                        "Preferred location",
                        "Industry preference"
                    ],
                    'prompt': "Please provide the following information:"
                }
            }
        },
        'cover_letter': {
            'initial': {
                'options': [
                    "1. Write a new cover letter",
                    "2. Customize existing letter",
                    "3. Review current draft",
                    "4. Get formatting tips"
                ],
                'prompt': "What would you like to do? Select (1-4):"
            },
            'write': {
                'fields': [
                    "Job title",
                    "Company name",
                    "Your relevant experience",
                    "Why you're interested",
                    "Your unique value"
                ],
                'prompt': "Please provide the following information:"
            }
        }
    }
}

def get_response_type(message):
    message = message.lower()
    if any(word in message for word in ['hi', 'hello', 'hey']):
        return 'greetings'
    elif any(word in message for word in ['resume', 'cv']):
        return 'resume'
    elif any(word in message for word in ['interview']):
        return 'interview'
    elif any(word in message for word in ['job', 'career', 'search']):
        return 'job_search'
    return 'default'

def get_detailed_response(response_type, sub_type=None, specific_type=None):
    if response_type not in responses:
        return random.choice(responses['default'])
    
    if isinstance(responses[response_type], dict):
        if sub_type and sub_type in responses[response_type]:
            if isinstance(responses[response_type][sub_type], dict):
                if specific_type and specific_type in responses[response_type][sub_type]:
                    return random.choice(responses[response_type][sub_type][specific_type])
                return random.choice(responses[response_type][sub_type]['initial'])
            return random.choice(responses[response_type][sub_type])
        return random.choice(responses[response_type]['initial'])
    
    return random.choice(responses[response_type])

def get_user_option_response(category, option):
    """Get response for user-selected option with icon-based options"""
    if category not in responses or 'user_options' not in responses[category]:
        return {
            'text': "I'm not sure about that option. Please try again.",
            'options': []
        }
    
    option_data = responses[category]['user_options'].get(option)
    if not option_data:
        return {
            'text': "I'm not sure about that option. Please try again.",
            'options': []
        }
    
    # Define icon mappings for each category
    icon_mappings = {
        'resume': {
            'create': '<i class="fas fa-file-alt"></i> Create New',
            'analyze': '<i class="fas fa-search"></i> Analyze',
            'improve': '<i class="fas fa-magic"></i> Improve',
            'ats': '<i class="fas fa-robot"></i> ATS Optimize'
        },
        'interview': {
            'practice': '<i class="fas fa-comments"></i> Practice',
            'industry': '<i class="fas fa-industry"></i> Industry Tips',
            'behavioral': '<i class="fas fa-users"></i> Behavioral',
            'feedback': '<i class="fas fa-chart-line"></i> Get Feedback'
        },
        'job_search': {
            'match': '<i class="fas fa-bullseye"></i> Match Jobs',
            'apply': '<i class="fas fa-paper-plane"></i> Apply',
            'salary': '<i class="fas fa-dollar-sign"></i> Salary',
            'insights': '<i class="fas fa-lightbulb"></i> Insights'
        },
        'cover_letter': {
            'write': '<i class="fas fa-pen"></i> Write New',
            'customize': '<i class="fas fa-edit"></i> Customize',
            'review': '<i class="fas fa-eye"></i> Review'
        }
    }
    
    # Get the next available options based on the current option
    next_options = []
    if option_data.get('next_steps'):
        for next_step in option_data['next_steps']:
            if next_step in icon_mappings.get(category, {}):
                next_options.append({
                    'text': icon_mappings[category][next_step],
                    'value': next_step
                })
    
    return {
        'text': option_data['response'],
        'options': next_options
    }

def get_next_step_response(category, step):
    if category in responses['next_steps'] and step in responses['next_steps'][category]:
        return responses['next_steps'][category][step]
    return None

def get_user_response_options(category, sub_type=None, specific_type=None):
    if category not in responses['user_response_options']:
        return None
        
    if not sub_type:
        return responses['user_response_options'][category]['initial']
        
    if sub_type not in responses['user_response_options'][category]:
        return None
        
    if not specific_type:
        return responses['user_response_options'][category][sub_type]
        
    if specific_type not in responses['user_response_options'][category][sub_type]:
        return None
        
    return responses['user_response_options'][category][sub_type][specific_type]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST', 'OPTIONS'])
def chat():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.json
        if not data or 'message' not in data:
            return jsonify({'error': 'No message provided'}), 400
            
        user_message = data.get('message', '')
        response_type = data.get('type', None)
        sub_type = data.get('subType', None)
        specific_type = data.get('specificType', None)
        user_option = data.get('option', None)
        category = data.get('category', None)
        
        # Get user response options
        response_options = get_user_response_options(category, sub_type, specific_type)
        
        # Handle user option selection
        if user_option and category:
            option_response = get_user_option_response(category, user_option)
            if option_response:
                return jsonify({
                    'response': option_response['response'],
                    'next_steps': option_response['next_steps'],
                    'options': response_options
                })
        
        # Handle next step selection
        if specific_type and category:
            next_step_response = get_next_step_response(category, specific_type)
            if next_step_response:
                return jsonify({
                    'response': next_step_response,
                    'options': response_options
                })
        
        # Get appropriate response
        response = get_detailed_response(response_type, sub_type, specific_type)
        
        return jsonify({
            'response': response,
            'options': response_options
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/save-resume', methods=['POST', 'OPTIONS'])
def save_resume():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    
    try:
        print("Received save-resume request")
        data = request.get_json()
        print(f"Received data: {data}")
        
        if not data:
            print("No data received")
            return jsonify({'error': 'No data received'}), 400
        
        # Generate filename with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'resumes/resume_{timestamp}.json'
        print(f"Saving to file: {filename}")
        
        # Save the resume data
        with open(filename, 'w') as f:
            json.dump(data, f, indent=4)
        
        print("Resume saved successfully")
        return jsonify({'success': True, 'message': 'Resume saved successfully'}), 200
    
    except Exception as e:
        print(f"Error saving resume: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/generate-pdf', methods=['POST', 'OPTIONS'])
def generate_pdf():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data received'}), 400
        
        # Generate PDF filename with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        pdf_filename = f'resumes/resume_{timestamp}.pdf'
        
        # Generate HTML content for the PDF
        html_content = generate_html_content(data)
        
        # Convert HTML to PDF
        pdfkit.from_string(html_content, pdf_filename)
        
        return send_file(pdf_filename, as_attachment=True)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def generate_html_content(data):
    # Your existing HTML template generation code here
    pass

if __name__ == '__main__':
    print("Starting Flask server...")
    print("Server will be available at http://localhost:5000")
    app.run(debug=True, port=5000, host='0.0.0.0') 