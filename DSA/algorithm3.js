// Recommendation System & Social Network Analysis Algorithm
// Uses graph algorithms and collaborative filtering for personalized recommendations

class RecommendationEngine {
    constructor() {
        this.studentGraph = new Map(); // Adjacency list for student connections
        this.activitySimilarityMatrix = new Map();
        this.skillGraphs = new Map();
        this.learningPaths = new Map();
        this.collaborationNetwork = new Map();
        
        // Activity categories for recommendation grouping
        this.activityCategories = {
            'academic': ['assignment_upload', 'quiz_submission', 'class_participation'],
            'social': ['peer_collaboration', 'forum_post', 'group_project'],
            'engagement': ['event_participation', 'resource_access', 'workshop_attendance'],
            'assessment': ['quiz_submission', 'test_completion', 'assignment_upload']
        };
    }

    // Build social network graph from collaboration data
    buildSocialNetwork(allStudentData) {
        // Initialize empty adjacency lists for all students
        allStudentData.forEach((_, studentId) => {
            if (!this.studentGraph.has(studentId)) {
                this.studentGraph.set(studentId, new Set());
            }
            if (!this.collaborationNetwork.has(studentId)) {
                this.collaborationNetwork.set(studentId, new Map());
            }
        });

        // Build connections based on collaboration activities
        allStudentData.forEach((studentData, studentId) => {
            const collaborations = studentData.activities.filter(
                activity => activity.type === 'peer_collaboration' && activity.collaborators
            );

            collaborations.forEach(collaboration => {
                collaboration.collaborators.forEach(collaboratorId => {
                    if (collaboratorId !== studentId && allStudentData.has(collaboratorId)) {
                        // Add bidirectional connection
                        this.studentGraph.get(studentId).add(collaboratorId);
                        this.studentGraph.get(collaboratorId).add(studentId);
                        
                        // Track collaboration strength
                        this.updateCollaborationStrength(studentId, collaboratorId);
                    }
                });
            });
        });

        return this.analyzeNetworkMetrics();
    }

    // Update collaboration strength between students
    updateCollaborationStrength(student1, student2) {
        const network1 = this.collaborationNetwork.get(student1);
        const network2 = this.collaborationNetwork.get(student2);
        
        // Increment collaboration count
        network1.set(student2, (network1.get(student2) || 0) + 1);
        network2.set(student1, (network2.get(student1) || 0) + 1);
    }

    // Analyze network metrics using graph algorithms
    analyzeNetworkMetrics() {
        const metrics = {
            totalNodes: this.studentGraph.size,
            totalEdges: this.getTotalEdges(),
            averageDegree: 0,
            networkDensity: 0,
            connectedComponents: this.findConnectedComponents(),
            centralityMeasures: this.calculateCentralityMeasures(),
            clusters: this.detectCommunities()
        };

        metrics.averageDegree = metrics.totalEdges / metrics.totalNodes;
        metrics.networkDensity = (2 * metrics.totalEdges) / (metrics.totalNodes * (metrics.totalNodes - 1));

        return metrics;
    }

    // Find connected components using DFS
    findConnectedComponents() {
        const visited = new Set();
        const components = [];

        this.studentGraph.forEach((_, studentId) => {
            if (!visited.has(studentId)) {
                const component = [];
                this.dfs(studentId, visited, component);
                components.push(component);
            }
        });

        return {
            count: components.length,
            components: components.map((comp, index) => ({
                id: index + 1,
                size: comp.length,
                members: comp
            }))
        };
    }

    // Depth-First Search for component detection
    dfs(node, visited, component) {
        visited.add(node);
        component.push(node);

        const neighbors = this.studentGraph.get(node) || new Set();
        neighbors.forEach(neighbor => {
            if (!visited.has(neighbor)) {
                this.dfs(neighbor, visited, component);
            }
        });
    }

    // Calculate centrality measures for influence analysis
    calculateCentralityMeasures() {
        const centrality = new Map();

        this.studentGraph.forEach((neighbors, studentId) => {
            // Degree centrality (normalized)
            const degreeCentrality = neighbors.size / (this.studentGraph.size - 1);
            
            // Closeness centrality (simplified - using average distance to direct neighbors)
            const closenessCentrality = neighbors.size > 0 ? 
                neighbors.size / this.calculateAverageDistance(studentId) : 0;
            
            centrality.set(studentId, {
                degree: degreeCentrality,
                closeness: closenessCentrality,
                influence: (degreeCentrality * 0.6 + closenessCentrality * 0.4)
            });
        });

        return centrality;
    }

    // Calculate average distance to neighbors (simplified)
    calculateAverageDistance(studentId) {
        const neighbors = this.studentGraph.get(studentId);
        if (neighbors.size === 0) return Infinity;

        let totalDistance = 0;
        let pathCount = 0;

        neighbors.forEach(neighbor => {
            // Direct neighbors have distance 1
            totalDistance += 1;
            pathCount++;
            
            // Check for common neighbors (distance 2 paths)
            const neighborNeighbors = this.studentGraph.get(neighbor);
            neighborNeighbors.forEach(secondDegree => {
                if (secondDegree !== studentId && !neighbors.has(secondDegree)) {
                    totalDistance += 2;
                    pathCount++;
                }
            });
        });

        return pathCount > 0 ? totalDistance / pathCount : 1;
    }

    // Detect communities using simplified modularity-based clustering
    detectCommunities() {
        const communities = [];
        const assigned = new Set();

        this.studentGraph.forEach((neighbors, studentId) => {
            if (!assigned.has(studentId)) {
                const community = this.growCommunity(studentId, assigned);
                if (community.length > 1) {
                    communities.push({
                        id: communities.length + 1,
                        members: community,
                        size: community.length,
                        density: this.calculateCommunityDensity(community)
                    });
                }
            }
        });

        return communities;
    }

    // Grow community from seed node
    growCommunity(seedNode, assigned) {
        const community = [seedNode];
        assigned.add(seedNode);
        
        const candidates = new Set(this.studentGraph.get(seedNode));
        
        // Greedily add nodes that increase modularity
        while (candidates.size > 0) {
            let bestCandidate = null;
            let bestScore = -1;
            
            candidates.forEach(candidate => {
                if (!assigned.has(candidate)) {
                    const score = this.calculateModularityGain(candidate, community);
                    if (score > bestScore) {
                        bestScore = score;
                        bestCandidate = candidate;
                    }
                }
            });
            
            if (bestCandidate && bestScore > 0) {
                community.push(bestCandidate);
                assigned.add(bestCandidate);
                candidates.delete(bestCandidate);
                
                // Add new candidates
                this.studentGraph.get(bestCandidate).forEach(neighbor => {
                    if (!assigned.has(neighbor)) {
                        candidates.add(neighbor);
                    }
                });
            } else {
                break;
            }
        }
        
        return community;
    }

    // Calculate modularity gain (simplified)
    calculateModularityGain(candidate, community) {
        const candidateNeighbors = this.studentGraph.get(candidate);
        const internalConnections = community.filter(member => 
            candidateNeighbors.has(member)
        ).length;
        
        return internalConnections / candidateNeighbors.size;
    }

    // Calculate community density
    calculateCommunityDensity(community) {
        if (community.length < 2) return 0;
        
        let internalEdges = 0;
        const maxPossibleEdges = (community.length * (community.length - 1)) / 2;
        
        community.forEach(member1 => {
            const neighbors = this.studentGraph.get(member1);
            community.forEach(member2 => {
                if (member1 !== member2 && neighbors.has(member2)) {
                    internalEdges++;
                }
            });
        });
        
        return (internalEdges / 2) / maxPossibleEdges;
    }

    // Generate personalized activity recommendations using collaborative filtering
    generateActivityRecommendations(targetStudentId, allStudentData, limit = 10) {
        const targetStudent = allStudentData.get(targetStudentId);
        if (!targetStudent) return [];

        // Find similar students using collaborative filtering
        const similarStudents = this.findSimilarStudents(targetStudentId, allStudentData);
        
        // Get activity preferences from similar students
        const recommendations = this.getRecommendationsFromSimilarUsers(
            targetStudentId, similarStudents, allStudentData
        );

        // Apply content-based filtering
        const contentRecommendations = this.getContentBasedRecommendations(
            targetStudent, allStudentData
        );

        // Combine and rank recommendations
        const combinedRecommendations = this.combineRecommendations(
            recommendations, contentRecommendations
        );

        return combinedRecommendations.slice(0, limit);
    }

    // Find similar students using cosine similarity
    findSimilarStudents(targetStudentId, allStudentData, topK = 10) {
        const targetStudent = allStudentData.get(targetStudentId);
        const targetVector = this.createActivityVector(targetStudent);
        
        const similarities = [];

        allStudentData.forEach((studentData, studentId) => {
            if (studentId !== targetStudentId) {
                const studentVector = this.createActivityVector(studentData);
                const similarity = this.calculateCosineSimilarity(targetVector, studentVector);
                
                similarities.push({
                    studentId,
                    similarity,
                    studentData
                });
            }
        });

        // Sort by similarity and return top K
        return similarities
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, topK);
    }

    // Create activity vector for similarity calculation
    createActivityVector(studentData) {
        const vector = new Map();
        
        // Initialize all activity types
        Object.values(this.activityCategories).flat().forEach(activityType => {
            vector.set(activityType, 0);
        });

        // Count activities by type
        studentData.activities.forEach(activity => {
            const count = vector.get(activity.type) || 0;
            vector.set(activity.type, count + 1);
        });

        return vector;
    }

    // Calculate cosine similarity between two activity vectors
    calculateCosineSimilarity(vector1, vector2) {
        let dotProduct = 0;
        let norm1 = 0;
        let norm2 = 0;

        vector1.forEach((value1, key) => {
            const value2 = vector2.get(key) || 0;
            dotProduct += value1 * value2;
            norm1 += value1 * value1;
        });

        vector2.forEach((value2) => {
            norm2 += value2 * value2;
        });

        if (norm1 === 0 || norm2 === 0) return 0;
        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }

    // Get recommendations from similar users
    getRecommendationsFromSimilarUsers(targetStudentId, similarStudents, allStudentData) {
        const targetActivities = new Set(
            allStudentData.get(targetStudentId).activities.map(a => a.type)
        );
        
        const recommendations = new Map();

        similarStudents.forEach(({ studentId, similarity, studentData }) => {
            studentData.activities.forEach(activity => {
                if (!targetActivities.has(activity.type)) {
                    const currentScore = recommendations.get(activity.type) || 0;
                    recommendations.set(
                        activity.type, 
                        currentScore + similarity * (activity.score || 1)
                    );
                }
            });
        });

        return Array.from(recommendations.entries())
            .map(([activityType, score]) => ({
                activityType,
                score,
                source: 'collaborative',
                reasoning: `Similar students with high engagement have participated in ${activityType}`
            }))
            .sort((a, b) => b.score - a.score);
    }

    // Get content-based recommendations
    getContentBasedRecommendations(targetStudent, allStudentData) {
        const recommendations = [];
        const currentActivities = targetStudent.activities;
        
        // Analyze student's current preferences
        const categoryPreferences = this.analyzeActivityPreferences(currentActivities);
        
        // Find underrepresented categories
        Object.entries(this.activityCategories).forEach(([category, activities]) => {
            const currentCategoryActivities = currentActivities.filter(
                a => activities.includes(a.type)
            ).length;
            
            const categoryAverage = this.calculateCategoryAverage(category, allStudentData);
            
            if (currentCategoryActivities < categoryAverage * 0.7) {
                // Recommend activities from underrepresented categories
                activities.forEach(activityType => {
                    const hasActivity = currentActivities.some(a => a.type === activityType);
                    if (!hasActivity) {
                        recommendations.push({
                            activityType,
                            score: (categoryAverage - currentCategoryActivities) * 10,
                            source: 'content',
                            reasoning: `You have lower engagement in ${category} activities compared to peers`
                        });
                    }
                });
            }
        });

        return recommendations.sort((a, b) => b.score - a.score);
    }

    // Analyze activity preferences
    analyzeActivityPreferences(activities) {
        const preferences = {};
        
        Object.entries(this.activityCategories).forEach(([category, activityTypes]) => {
            const categoryCount = activities.filter(a => activityTypes.includes(a.type)).length;
            preferences[category] = categoryCount;
        });

        return preferences;
    }

    // Calculate average for activity category
    calculateCategoryAverage(category, allStudentData) {
        const categoryActivities = this.activityCategories[category];
        let totalCount = 0;
        
        allStudentData.forEach(studentData => {
            const categoryCount = studentData.activities.filter(
                a => categoryActivities.includes(a.type)
            ).length;
            totalCount += categoryCount;
        });

        return totalCount / allStudentData.size;
    }

    // Combine collaborative and content-based recommendations
    combineRecommendations(collaborative, contentBased) {
        const combined = new Map();
        
        // Add collaborative recommendations with weight
        collaborative.forEach(rec => {
            combined.set(rec.activityType, {
                ...rec,
                finalScore: rec.score * 0.7 // 70% weight for collaborative
            });
        });
        
        // Add or update with content-based recommendations
        contentBased.forEach(rec => {
            const existing = combined.get(rec.activityType);
            if (existing) {
                existing.finalScore += rec.score * 0.3; // 30% weight for content
                existing.reasoning += ` Also, ${rec.reasoning.toLowerCase()}`;
            } else {
                combined.set(rec.activityType, {
                    ...rec,
                    finalScore: rec.score * 0.3
                });
            }
        });

        return Array.from(combined.values()).sort((a, b) => b.finalScore - a.finalScore);
    }

    // Generate learning path recommendations using graph traversal
    generateLearningPath(studentId, targetSkills, currentActivities) {
        const skillGraph = this.buildSkillDependencyGraph();
        const currentSkills = this.inferCurrentSkills(currentActivities);
        
        // Find shortest path to target skills using BFS
        const paths = targetSkills.map(targetSkill => 
            this.findLearningPathBFS(currentSkills, targetSkill, skillGraph)
        );

        return {
            targetSkills,
            currentSkills: Array.from(currentSkills),
            learningPaths: paths.filter(path => path !== null),
            estimatedDuration: this.estimatePathDuration(paths),
            prerequisites: this.identifyPrerequisites(targetSkills, skillGraph)
        };
    }

    // Build skill dependency graph
    buildSkillDependencyGraph() {
        const skillGraph = new Map();
        
        // Define skill dependencies (simplified example)
        const skillDependencies = {
            'advanced_programming': ['basic_programming', 'data_structures'],
            'data_structures': ['basic_programming'],
            'algorithms': ['data_structures', 'mathematics'],
            'database_design': ['basic_programming', 'data_modeling'],
            'web_development': ['basic_programming', 'html_css'],
            'data_analysis': ['statistics', 'basic_programming'],
            'machine_learning': ['data_analysis', 'algorithms', 'statistics']
        };

        // Build adjacency list
        Object.entries(skillDependencies).forEach(([skill, dependencies]) => {
            if (!skillGraph.has(skill)) {
                skillGraph.set(skill, { dependencies: [], unlocks: [] });
            }
            
            skillGraph.get(skill).dependencies = dependencies;
            
            dependencies.forEach(dependency => {
                if (!skillGraph.has(dependency)) {
                    skillGraph.set(dependency, { dependencies: [], unlocks: [] });
                }
                skillGraph.get(dependency).unlocks.push(skill);
            });
        });

        return skillGraph;
    }

    // Infer current skills from activities
    inferCurrentSkills(activities) {
        const skills = new Set();
        
        // Map activities to skills (simplified)
        const activityToSkill = {
            'assignment_upload': 'basic_programming',
            'quiz_submission': 'knowledge_assessment',
            'class_participation': 'communication',
            'peer_collaboration': 'teamwork',
            'forum_post': 'communication'
        };

        activities.forEach(activity => {
            const skill = activityToSkill[activity.type];
            if (skill) {
                skills.add(skill);
            }
        });

        return skills;
    }

    // Find learning path using BFS
    findLearningPathBFS(currentSkills, targetSkill, skillGraph) {
        if (currentSkills.has(targetSkill)) {
            return { skill: targetSkill, path: [targetSkill], distance: 0 };
        }

        const queue = [{ skill: targetSkill, path: [targetSkill] }];
        const visited = new Set([targetSkill]);

        while (queue.length > 0) {
            const { skill, path } = queue.shift();
            const skillData = skillGraph.get(skill);

            if (!skillData) continue;

            for (const dependency of skillData.dependencies) {
                if (currentSkills.has(dependency)) {
                    return {
                        skill: targetSkill,
                        path: [dependency, ...path],
                        distance: path.length
                    };
                }

                if (!visited.has(dependency)) {
                    visited.add(dependency);
                    queue.push({
                        skill: dependency,
                        path: [dependency, ...path]
                    });
                }
            }
        }

        return null; // No path found
    }

    // Get total edges in the graph
    getTotalEdges() {
        let count = 0;
        this.studentGraph.forEach(neighbors => {
            count += neighbors.size;
        });
        return count / 2; // Divide by 2 for undirected graph
    }

    // Generate study group recommendations
    generateStudyGroupRecommendations(studentId, allStudentData) {
        const targetStudent = allStudentData.get(studentId);
        if (!targetStudent) return [];

        const recommendations = [];
        
        // Find students with complementary skills
        const complementaryStudents = this.findComplementaryStudents(
            studentId, allStudentData
        );
        
        // Find students in same community
        const communityMembers = this.findCommunityMembers(studentId);
        
        // Recommend optimal group compositions
        const optimalGroups = this.generateOptimalGroups(
            studentId, complementaryStudents, communityMembers, allStudentData
        );

        return optimalGroups.slice(0, 5); // Top 5 group recommendations
    }

    findComplementaryStudents(targetId, allStudentData) {
        const targetSkills = this.inferCurrentSkills(allStudentData.get(targetId).activities);
        const complementary = [];

        allStudentData.forEach((studentData, studentId) => {
            if (studentId !== targetId) {
                const studentSkills = this.inferCurrentSkills(studentData.activities);
                const complementScore = this.calculateComplementScore(targetSkills, studentSkills);
                
                if (complementScore > 0.3) {
                    complementary.push({
                        studentId,
                        complementScore,
                        sharedSkills: this.getSharedSkills(targetSkills, studentSkills),
                        uniqueSkills: this.getUniqueSkills(studentSkills, targetSkills)
                    });
                }
            }
        });

        return complementary.sort((a, b) => b.complementScore - a.complementScore);
    }

    calculateComplementScore(skills1, skills2) {
        const shared = this.getSharedSkills(skills1, skills2).length;
        const unique1 = this.getUniqueSkills(skills1, skills2).length;
        const unique2 = this.getUniqueSkills(skills2, skills1).length;
        
        // Balance between shared skills and complementary skills
        return (shared * 0.3 + (unique1 + unique2) * 0.7) / (skills1.size + skills2.size);
    }

    getSharedSkills(skills1, skills2) {
        return Array.from(skills1).filter(skill => skills2.has(skill));
    }

    getUniqueSkills(skills1, skills2) {
        return Array.from(skills1).filter(skill => !skills2.has(skill));
    }

    findCommunityMembers(studentId) {
        // Implementation would depend on community detection results
        return Array.from(this.studentGraph.get(studentId) || []);
    }

    generateOptimalGroups(targetId, complementary, community, allStudentData) {
        const groups = [];
        const optimalGroupSize = 4;

        // Generate different group compositions
        for (let i = 0; i < Math.min(5, complementary.length); i++) {
            const group = [targetId];
            
            // Add complementary students
            const selectedComplementary = complementary.slice(0, optimalGroupSize - 1);
            selectedComplementary.forEach(student => group.push(student.studentId));
            
            // Calculate group metrics
            const groupMetrics = this.calculateGroupMetrics(group, allStudentData);
            
            groups.push({
                members: group,
                size: group.length,
                ...groupMetrics,
                recommendation: `Optimal group for skill diversity and collaboration`
            });
        }

        return groups.sort((a, b) => b.synergy - a.synergy);
    }

    calculateGroupMetrics(group, allStudentData) {
        let totalEngagement = 0;
        let avgCollaboration = 0;
        const allSkills = new Set();

        group.forEach(studentId => {
            const student = allStudentData.get(studentId);
            if (student) {
                totalEngagement += student.totalScore || 0;
                const skills = this.inferCurrentSkills(student.activities);
                skills.forEach(skill => allSkills.add(skill));
            }
        });

        return {
            avgEngagement: totalEngagement / group.length,
            skillDiversity: allSkills.size,
            synergy: (allSkills.size * 10) + (totalEngagement / group.length * 0.1)
        };
    }
}

// Export for use in other modules
window.RecommendationEngine = RecommendationEngine;
export default RecommendationEngine;